/**
 * Donation model
 *
 * Status lifecycle:
 *   available → claimed → collected → expired (via cron if not claimed in time)
 *
 * SDG tags on each donation help the impact dashboard aggregate by goal.
 */

const mongoose = require('mongoose');

const STATUSES       = ['available', 'claimed', 'collected', 'expired', 'removed'];
const CATEGORIES     = ['veg', 'non_veg', 'vegan', 'packaged', 'cooked', 'raw_produce', 'dairy', 'bakery', 'other'];
const QUANTITY_UNITS = ['servings', 'kg', 'litres', 'pieces', 'boxes', 'packets'];

const pointSchema = new mongoose.Schema({
  type:        { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number] }   // [lng, lat]
}, { _id: false });

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ── Food details ───────────────────────────────────────────────
  foodName:        { type: String, required: true, trim: true, maxlength: 200 },
  category:        { type: String, enum: CATEGORIES, required: true },
  description:     { type: String, trim: true, maxlength: 1000 },
  ingredients:     { type: String, trim: true },   // free-text
  allergens:       [{ type: String, trim: true }], // e.g. ['nuts', 'gluten']
  storageInstructions: { type: String, trim: true, maxlength: 500 },

  // ── Quantity ───────────────────────────────────────────────────
  quantity:     { type: Number, required: true, min: 0.1 },
  quantityUnit: { type: String, enum: QUANTITY_UNITS, default: 'servings' },

  // ── Timing ────────────────────────────────────────────────────
  preparedAt:    { type: Date, required: true },   // cannot be future (validated in route)
  shelfLifeHours:{ type: Number, required: true, min: 0.5, max: 120 },
  expiresAt:     { type: Date, required: true },   // preparedAt + shelfLifeHours

  pickupWindowStart: { type: Date, required: true },
  pickupWindowEnd:   { type: Date, required: true },

  // ── Pickup ─────────────────────────────────────────────────────
  pickupAddress: {
    line1:   { type: String, required: true, trim: true },
    area:    { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  location: { type: pointSchema, index: '2dsphere' },
  contactPhone: { type: String, trim: true },

  // ── Media ──────────────────────────────────────────────────────
  photoUrl: { type: String, default: null },

  // ── Status & lifecycle ─────────────────────────────────────────
  status: {
    type: String,
    enum: STATUSES,
    default: 'available',
    index: true
  },

  // ── Safety ─────────────────────────────────────────────────────
  fssaiCompliant:  { type: Boolean, default: false },
  safetyAccepted:  { type: Boolean, required: true }, // donor accepted disclaimer
  safetyAcceptedAt:{ type: Date },

  // ── SDG tagging ────────────────────────────────────────────────
  sdgTags: {
    type: [String],
    default: ['SDG2', 'SDG12'],   // always tagged; admin can enrich
    enum: ['SDG1','SDG2','SDG3','SDG11','SDG12','SDG17']
  },

  // ── Reports ───────────────────────────────────────────────────
  reportCount: { type: Number, default: 0 },
  reports: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason:     { type: String, trim: true },
    reportedAt: { type: Date, default: Date.now }
  }],

  // Admin
  removedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  removalReason: { type: String }

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────
donationSchema.index({ status: 1, expiresAt: 1 });
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ donor: 1, status: 1 });
donationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donation', donationSchema);
