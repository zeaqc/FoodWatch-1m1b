/**
 * Notification model — in-app notification store.
 * Email/SMS are fired at creation time via notification util.
 */
const mongoose = require('mongoose');

const NOTIF_TYPES = [
  'new_donation_nearby',
  'donation_claimed',
  'claim_confirmed',
  'collected',
  'expiring_soon',
  'report_received',
  'account_verified',
  'general'
];

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: NOTIF_TYPES, required: true },
  title:   { type: String, required: true, maxlength: 120 },
  body:    { type: String, required: true, maxlength: 500 },
  link:    { type: String },   // frontend route
  read:    { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed } // arbitrary payload
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
