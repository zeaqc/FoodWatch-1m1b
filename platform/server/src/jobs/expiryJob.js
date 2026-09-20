/**
 * Expiry cron job — runs every 2 minutes.
 * Marks donations 'expired' if expiresAt has passed and status is still 'available'.
 * Also sends 30-min expiry warnings to donors.
 */
const cron     = require('node-cron');
const Donation = require('../models/Donation');
const User     = require('../models/User');
const { notify } = require('../utils/notify');

const startExpiryJob = () => {
  // ── Expire overdue donations every 2 minutes ──────────────────
  cron.schedule('*/2 * * * *', async () => {
    try {
      const now     = new Date();
      const expired = await Donation.updateMany(
        { status: 'available', expiresAt: { $lte: now } },
        { $set: { status: 'expired' } }
      );
      if (expired.modifiedCount > 0) {
        console.log(`[ExpiryJob] Expired ${expired.modifiedCount} donation(s)`);
      }
    } catch (err) {
      console.error('[ExpiryJob] Error expiring donations:', err.message);
    }
  });

  // ── Warn donors 30 minutes before expiry ─────────────────────
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now     = new Date();
      const soon    = new Date(now.getTime() + 30 * 60 * 1000);

      const warnDonations = await Donation.find({
        status:    'available',
        expiresAt: { $gt: now, $lte: soon }
      }).populate('donor', 'name email _id');

      for (const d of warnDonations) {
        const minsLeft = Math.round((d.expiresAt - now) / 60000);
        await notify({
          userId: d.donor._id,
          type:   'expiring_soon',
          title:  `⚠️ "${d.foodName}" expires in ~${minsLeft} min`,
          body:   'No one has claimed it yet. Consider extending pickup window or disposing safely.',
          link:   `/donor/donations/${d._id}`,
          email:  {
            to: d.donor.email,
            templateName: 'donationExpiringSoon',
            templateArgs: [d.donor.name, d.foodName, minsLeft]
          }
        });
      }
    } catch (err) {
      console.error('[ExpiryJob] Warning job error:', err.message);
    }
  });

  console.log('⏱️  Expiry cron job started');
};

module.exports = { startExpiryJob };
