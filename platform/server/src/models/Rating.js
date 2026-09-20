/**
 * Rating model — created after collection is confirmed.
 * Both donor ↔ receiver can rate each other once per donation.
 */
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  claim:    { type: mongoose.Schema.Types.ObjectId, ref: 'Claim',    required: true },
  rater:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  ratee:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  score:    { type: Number, min: 1, max: 5, required: true },
  comment:  { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

ratingSchema.index({ donation: 1, rater: 1 }, { unique: true });
ratingSchema.index({ ratee: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
