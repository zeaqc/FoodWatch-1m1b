/**
 * User model — covers Donor, Receiver and Admin roles.
 *
 * Aadhaar compliance:
 *   - We NEVER store the full 12-digit Aadhaar number.
 *   - We store only the last 4 digits (maskedAadhaar) as a reference.
 *   - verificationRef stores the token returned by UIDAI/DigiLocker eKYC
 *     once that integration is live; in dev mode a placeholder UUID is used.
 *   - consentGiven + consentAt record the explicit user consent at sign-up.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const ROLES = ['donor', 'receiver', 'admin'];
const DONOR_TYPES = ['individual', 'restaurant', 'caterer', 'event_host', 'ngo', 'other'];
const RECEIVER_TYPES = ['individual', 'ngo', 'shelter', 'community_kitchen', 'other'];

const pointSchema = new mongoose.Schema({
  type:        { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], default: [0, 0] }  // [lng, lat]
}, { _id: false });

const userSchema = new mongoose.Schema({
  // ── Common fields ──────────────────────────────────────────────
  role:         { type: String, enum: ROLES, required: true },
  name:         { type: String, required: true, trim: true, maxlength: 120 },
  email:        { type: String, required: true, lowercase: true, trim: true, unique: true },
  phone:        { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  isVerified:   { type: Boolean, default: false },   // admin-verified
  isActive:     { type: Boolean, default: true },    // soft-delete flag
  avatarUrl:    { type: String, default: null },

  // ── OTP for phone verification ────────────────────────────────
  phoneOtp:        { type: String },
  phoneOtpExpires: { type: Date },
  phoneVerified:   { type: Boolean, default: false },

  // ── Address / location ─────────────────────────────────────────
  address: {
    line1:   { type: String, trim: true },
    area:    { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    pincode: { type: String, trim: true }
  },
  location: { type: pointSchema, index: '2dsphere' },

  // ── Donor-specific ─────────────────────────────────────────────
  donorType:      { type: String, enum: DONOR_TYPES },
  orgName:        { type: String, trim: true },    // restaurant/caterer name
  fssaiNumber:    { type: String, trim: true },    // optional FSSAI licence
  // Aadhaar (last 4 only, with explicit consent)
  maskedAadhaar:  { type: String, trim: true, match: /^\d{4}$/ },
  verificationRef:{ type: String },               // eKYC token / placeholder UUID
  consentGiven:   { type: Boolean, default: false },
  consentAt:      { type: Date },

  // ── Receiver-specific ──────────────────────────────────────────
  receiverType:   { type: String, enum: RECEIVER_TYPES },
  ngoRegNumber:   { type: String, trim: true },

  // ── Stats (denormalised for quick dashboard reads) ─────────────
  totalDonated:   { type: Number, default: 0 },   // for donors
  totalReceived:  { type: Number, default: 0 },   // for receivers

  // ── Password reset ─────────────────────────────────────────────
  resetToken:        { type: String },
  resetTokenExpires: { type: Date }

}, { timestamps: true });

// ── Indexes ───────────────────────────────────────────────────────
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, isActive: 1 });

// ── Instance methods ──────────────────────────────────────────────
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.phoneOtp;
  delete obj.phoneOtpExpires;
  delete obj.verificationRef;
  delete obj.resetToken;
  delete obj.resetTokenExpires;
  return obj;
};

// ── Pre-save: hash password ───────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);
