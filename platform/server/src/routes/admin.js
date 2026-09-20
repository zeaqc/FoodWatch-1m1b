const express      = require('express');
const Donation     = require('../models/Donation');
const Claim        = require('../models/Claim');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');
const { notify } = require('../utils/notify');

const router = express.Router();
const isAdmin = [protect, requireRole('admin')];

// ── GET /api/admin/stats — platform overview ──────────────────────
router.get('/stats', ...isAdmin, async (req, res) => {
  try {
    const [
      totalDonors,
      totalReceivers,
      totalDonations,
      activeDonations,
      totalClaimed,
      totalCollected,
      totalExpired,
      totalReported,
      unverifiedDonors,
      unverifiedReceivers,
      pendingReports
    ] = await Promise.all([
      User.countDocuments({ role: 'donor', isActive: true }),
      User.countDocuments({ role: 'receiver', isActive: true }),
      Donation.countDocuments({}),
      Donation.countDocuments({ status: 'available' }),
      Donation.countDocuments({ status: 'claimed' }),
      Donation.countDocuments({ status: 'collected' }),
      Donation.countDocuments({ status: 'expired' }),
      Donation.countDocuments({ reportCount: { $gt: 0 }, status: { $ne: 'removed' } }),
      User.countDocuments({ role: 'donor', isVerified: false, isActive: true }),
      User.countDocuments({ role: 'receiver', isVerified: false, isActive: true }),
      Donation.countDocuments({ reportCount: { $gte: 1 }, status: { $nin: ['removed','expired'] } })
    ]);

    res.json({
      users: { totalDonors, totalReceivers, unverifiedDonors, unverifiedReceivers },
      donations: { totalDonations, activeDonations, totalClaimed, totalCollected, totalExpired },
      safety: { totalReported, pendingReports }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/users — paginated user list ────────────────────
router.get('/users', ...isAdmin, async (req, res) => {
  const { role, isVerified, page = 1, limit = 25, q } = req.query;
  const filter = { isActive: true };
  if (role)       filter.role = role;
  if (isVerified !== undefined) filter.isVerified = isVerified === 'true';
  if (q)          filter.name = new RegExp(q, 'i');

  try {
    const users = await User.find(filter)
      .select('-passwordHash -phoneOtp -resetToken -verificationRef')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await User.countDocuments(filter);
    res.json({ users, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/admin/users/:id/verify — verify a user ────────────
router.patch('/users/:id/verify', ...isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    await notify({
      userId: user._id,
      type:   'account_verified',
      title:  'Your account is verified ✅',
      body:   'FoodWatch admin has verified your account. Welcome!',
      email:  {
        to: user.email,
        templateName: 'accountVerified',
        templateArgs: [user.name]
      }
    });

    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/admin/users/:id/disable — disable a user ──────────
router.patch('/users/:id/disable', ...isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User disabled', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/donations — all donations ──────────────────────
router.get('/donations', ...isAdmin, async (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  try {
    const donations = await Donation.find(filter)
      .populate('donor', 'name email orgName')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Donation.countDocuments(filter);
    res.json({ donations, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/admin/reports — donations with reports ───────────────
router.get('/reports', ...isAdmin, async (req, res) => {
  try {
    const reported = await Donation.find({ reportCount: { $gt: 0 }, status: { $nin: ['removed','expired'] } })
      .populate('donor', 'name email')
      .sort({ reportCount: -1 });
    res.json({ reported });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/admin/donations/:id/remove — remove a listing ─────
router.patch('/donations/:id/remove', ...isAdmin, [
], async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        status: 'removed',
        removedBy: req.user.id,
        removalReason: req.body.reason || 'Removed by admin'
      },
      { new: true }
    );
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ message: 'Donation removed', donation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
