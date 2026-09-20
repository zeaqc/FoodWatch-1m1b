/**
 * Claim model — one claim per donation (atomic, prevent double-claim via unique index).
 */
const mongoose = require('mongoose');

const CLAIM_STATUSES = ['pending', 'confirmed', 'collected', 'cancelled', 'expired'];

const claimSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status:  { type: String, enum: CLAIM_STATUSES, default: 'pending', index: true },

  // Timestamps for the lifecycle
  claimedAt:   { type: Date, default: Date.now },
  collectedAt: { type: Date },
  cancelledAt: { type: Date },

  // Confirmation tokens (short codes shared between donor & receiver)
  donorConfirmed:    { type: Boolean, default: false },
  receiverConfirmed: { type: Boolean, default: false },

  // Notes
  notes: { type: String, trim: true, maxlength: 500 }

}, { timestamps: true });

// ── Unique constraint: one active claim per donation ───────────────
// Combined with application-level $findOneAndUpdate with a filter on status
claimSchema.index({ donation: 1 }, { unique: true });
claimSchema.index({ receiver: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
