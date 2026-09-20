const express  = require('express');
const { body, validationResult } = require('express-validator');
const Rating   = require('../models/Rating');
const Claim    = require('../models/Claim');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/ratings — submit a rating after collection ──────────
router.post('/', protect, [
  body('claimId').notEmpty().withMessage('Claim ID required'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1–5').toInt(),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const message = errorList.map(e => e.msg).filter(Boolean).join(', ') || 'Validation error';
    return res.status(422).json({ message, errors: errorList });
  }

  const { claimId, score, comment } = req.body;

  try {
    const claim = await Claim.findById(claimId).populate('donation', 'donor');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    if (claim.status !== 'collected') {
      return res.status(400).json({ message: 'Ratings only allowed after collection is confirmed' });
    }

    const donorId    = claim.donation.donor.toString();
    const receiverId = claim.receiver.toString();
    const me         = req.user.id;

    // Determine rater/ratee pair
    let ratee;
    if (me === donorId) ratee = receiverId;
    else if (me === receiverId) ratee = donorId;
    else return res.status(403).json({ message: 'Not a party to this claim' });

    const existing = await Rating.findOne({ donation: claim.donation._id, rater: me });
    if (existing) return res.status(409).json({ message: 'You have already rated this transaction' });

    const rating = await Rating.create({
      donation: claim.donation._id,
      claim:    claim._id,
      rater:    me,
      ratee,
      score,
      comment
    });

    res.status(201).json({ rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/ratings/user/:userId — public ratings for a user ─────
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate('rater', 'name donorType receiverType')
      .sort({ createdAt: -1 })
      .limit(50);

    const avg = ratings.length
      ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
      : null;

    res.json({ ratings, averageScore: avg ? avg.toFixed(1) : null, count: ratings.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
