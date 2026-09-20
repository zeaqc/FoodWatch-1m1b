const express = require('express');
const Claim = require('../models/Claim');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect, requireRole, requirePhoneVerified } = require('../middleware/auth');
const { notify } = require('../utils/notify');

const router = express.Router();

// ── POST /api/claims/:donationId — claim a donation ────────────────
// Atomic: uses findOneAndUpdate with status check to prevent race conditions
router.post('/:donationId', protect, requireRole('receiver'), requirePhoneVerified, async (req, res) => {
  try {
    // Step 1: Atomically transition donation from 'available' → 'claimed'
    const donation = await Donation.findOneAndUpdate(
      {
        _id: req.params.donationId,
        status: 'available',
        expiresAt: { $gt: new Date() }
      },
      { $set: { status: 'claimed' } },
      { new: true }
    ).populate('donor', 'name email');

    if (!donation) {
      return res.status(409).json({
        message: 'Donation is no longer available or has expired. Someone else may have claimed it first.'
      });
    }

    // Step 2: Create Claim record
    const claim = await Claim.create({
      donation: donation._id,
      receiver: req.user.id,
      notes: req.body.notes
    });

    // Step 3: Update receiver stats
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalReceived: 1 } });

    // Step 4: Notify donor
    const receiver = await User.findById(req.user.id).select('name email');
    await notify({
      userId: donation.donor._id,
      type: 'donation_claimed',
      title: 'Your donation has been claimed!',
      body: `${receiver.name} has claimed "${donation.foodName}". Please keep it ready.`,
      link: `/donor/donations/${donation._id}`,
      email: {
        to: donation.donor.email,
        templateName: 'donationClaimed',
        templateArgs: [donation.donor.name, donation.foodName, receiver.name]
      }
    });

    // Step 5: Notify receiver
    const addressStr = [
      donation.pickupAddress.line1,
      donation.pickupAddress.area,
      donation.pickupAddress.city
    ].filter(Boolean).join(', ');

    await notify({
      userId: req.user.id,
      type: 'claim_confirmed',
      title: `Claim confirmed — ${donation.foodName}`,
      body: `Pickup from: ${addressStr}`,
      link: `/receiver/claims/${claim._id}`,
      email: {
        to: receiver.email,
        templateName: 'claimConfirmed',
        templateArgs: [receiver.name, donation.foodName, addressStr]
      }
    });

    res.status(201).json({ claim, donation });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate claim (unique index on donation field)
      return res.status(409).json({ message: 'This donation has already been claimed.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error claiming donation' });
  }
});

// ── GET /api/claims/my — receiver's claims ─────────────────────────
router.get('/my', protect, requireRole('receiver'), async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { receiver: req.user.id };
  if (status) filter.status = status;

  try {
    const claims = await Claim.find(filter)
      .populate({
        path: 'donation',
        select: '-reports',
        populate: { path: 'donor', select: 'name orgName donorType phone' }
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Claim.countDocuments(filter);
    res.json({ claims, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/claims/:id — single claim ────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate({
        path: 'donation', select: '-reports',
        populate: { path: 'donor', select: 'name orgName phone avatarUrl' }
      })
      .populate('receiver', 'name phone');

    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    // Only the donor or receiver involved may view
    const donorId = claim.donation.donor._id.toString();
    if (req.user.id !== donorId && req.user.id !== claim.receiver._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorised' });
    }

    res.json({ claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/claims/:id/receiver-collected — receiver marks collected ──
router.patch('/:id/receiver-collected', protect, requireRole('receiver'), async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, receiver: req.user.id }).populate('donation');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status !== 'pending' && claim.status !== 'confirmed') {
      return res.status(400).json({ message: `Cannot mark collected from status: ${claim.status}` });
    }

    claim.receiverConfirmed = true;
    await claim.save();

    // Notify receiver in their in-app notifications
    const foodName = claim.donation?.foodName || 'Food donation';
    await notify({
      userId: req.user.id,
      type: 'collected',
      title: '🍱 Food Marked as Collected!',
      body: `You marked "${foodName}" as collected. Thank you for rescuing surplus food!`,
      link: '/receiver'
    });

    await tryFinishCollection(claim);

    res.json({ claim });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/claims/:id/donor-confirmed — donor confirms handover ──
router.patch('/:id/donor-confirmed', protect, requireRole('donor'), async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('donation');
    if (!claim || claim.donation.donor.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Claim not found or not yours' });
    }

    claim.donorConfirmed = true;
    await claim.save();
    await tryFinishCollection(claim);

    res.json({ claim });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/claims/:id/cancel — receiver cancels ───────────────
router.patch('/:id/cancel', protect, requireRole('receiver'), async (req, res) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, receiver: req.user.id });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (!['pending', 'confirmed'].includes(claim.status)) {
      return res.status(400).json({ message: 'Cannot cancel this claim' });
    }

    claim.status = 'cancelled';
    claim.cancelledAt = new Date();
    await claim.save();

    // Reopen donation
    await Donation.findByIdAndUpdate(claim.donation, { status: 'available' });

    res.json({ message: 'Claim cancelled. Donation is now available again.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Helper: mark donation + claim as collected when both sides confirm ──
async function tryFinishCollection(claim) {
  if (!claim.donorConfirmed || !claim.receiverConfirmed) return;

  claim.status = 'collected';
  claim.collectedAt = new Date();
  await claim.save();

  await Donation.findByIdAndUpdate(claim.donation, { status: 'collected' });

  // Notify both parties
  const donation = await Donation.findById(claim.donation).populate('donor', 'name email');
  const receiver = await User.findById(claim.receiver).select('name email');

  await notify({
    userId: donation.donor._id,
    type: 'collected',
    title: '✅ Collection complete!',
    body: `${receiver.name} collected "${donation.foodName}". Thank you for fighting hunger!`,
    email: {
      to: donation.donor.email,
      templateName: 'collectionComplete',
      templateArgs: [donation.donor.name, receiver.name, donation.foodName]
    }
  });

  await notify({
    userId: receiver._id,
    type: 'collected',
    title: '🎉 Collection Complete & Verified!',
    body: `Handover of "${donation.foodName}" confirmed. Thank you for making a difference!`,
    link: '/receiver'
  });
}

module.exports = router;
