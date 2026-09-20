/**
 * Impact dashboard route — aggregates real platform data for SDG visualisation.
 * Public endpoint (no auth required) so the static pages can embed live stats.
 */
const express  = require('express');
const Donation = require('../models/Donation');
const User     = require('../models/User');
const Claim    = require('../models/Claim');

const router = express.Router();

// ── GET /api/impact — real-time impact numbers ────────────────────
router.get('/', async (req, res) => {
  try {
    const [
      mealsShared,
      donationsActive,
      totalDonors,
      collectionsThisMonth,
      totalKgSaved,
      cityBreakdown,
      categoryBreakdown,
      weeklyTrend
    ] = await Promise.all([
      // total collected = meals shared
      Donation.countDocuments({ status: 'collected' }),

      // currently active
      Donation.countDocuments({ status: 'available', expiresAt: { $gt: new Date() } }),

      // registered donors
      User.countDocuments({ role: 'donor', isActive: true }),

      // this month's collections
      Donation.countDocuments({
        status: 'collected',
        updatedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }),

      // kg estimate: sum(quantity * factor) where unit is kg, else count servings ÷ 3
      Donation.aggregate([
        { $match: { status: 'collected' } },
        {
          $group: {
            _id: null,
            totalKg: {
              $sum: {
                $cond: [
                  { $eq: ['$quantityUnit', 'kg'] },
                  '$quantity',
                  { $divide: ['$quantity', 3] }   // rough: 3 servings ≈ 1 kg
                ]
              }
            }
          }
        }
      ]),

      // top 5 cities
      Donation.aggregate([
        { $match: { status: 'collected' } },
        { $group: { _id: '$pickupAddress.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // by food category
      Donation.aggregate([
        { $match: { status: { $in: ['available','claimed','collected'] } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // last 7 days daily collections
      Donation.aggregate([
        {
          $match: {
            status:    'collected',
            updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      mealsShared,
      donationsActive,
      totalDonors,
      collectionsThisMonth,
      kgFoodSaved: Math.round((totalKgSaved[0]?.totalKg || 0) * 10) / 10,
      co2Saved:    Math.round((totalKgSaved[0]?.totalKg || 0) * 2.5 * 10) / 10,  // ~2.5 kg CO2/kg food
      cityBreakdown,
      categoryBreakdown,
      weeklyTrend,
      sdgAlignment: {
        SDG1:  { name: 'No Poverty',             metric: `${mealsShared} meals`,      icon: '🏠' },
        SDG2:  { name: 'Zero Hunger',             metric: `${mealsShared} meals`,      icon: '🌾' },
        SDG3:  { name: 'Good Health',             metric: 'FSSAI-compliant food only', icon: '💊' },
        SDG11: { name: 'Sustainable Cities',      metric: `${(totalKgSaved[0]?.totalKg || 0).toFixed(0)} kg diverted from landfill`, icon: '🏙️' },
        SDG12: { name: 'Responsible Consumption', metric: `${donationsActive} active listings`, icon: '♻️' },
        SDG17: { name: 'Partnerships for Goals',  metric: `${totalDonors} donor partners`, icon: '🤝' }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching impact data' });
  }
});

// ── GET /api/impact/notifications — user's in-app notifications ───
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/notifications/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
  res.json({ message: 'All notifications marked read' });
});

module.exports = router;
