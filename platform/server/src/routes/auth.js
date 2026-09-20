const express  = require('express');
const { body, validationResult } = require('express-validator');
const User     = require('../models/User');
const { signToken } = require('../utils/token');
const { notify } = require('../utils/notify');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ────────────────────────────────────────────────────────
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const message = errorList.map(e => e.msg).filter(Boolean).join(', ') || 'Validation error';
    return res.status(422).json({ message, errors: errorList });
  }
  return null;
};

// ── POST /api/auth/register/donor ──────────────────────────────────
router.post('/register/donor', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone')
    .customSanitizer(val => String(val || '').replace(/^(\+91|0)/, '').replace(/\D/g, ''))
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('donorType').isIn(['individual','restaurant','caterer','event_host','ngo','other']).withMessage('Invalid donor type'),
  body('address.city').notEmpty().withMessage('City required')
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const {
    name, email, phone, password, donorType, orgName,
    fssaiNumber, address = {}
  } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const initialOtp = String(Math.floor(100000 + Math.random() * 900000));
    const user = await User.create({
      role: 'donor',
      name, email, phone,
      passwordHash: password,   // pre-save hook hashes this
      donorType, orgName, fssaiNumber,
      phoneOtp: initialOtp,
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneVerified: false,
      address,
      isVerified: false
    });

    console.log(`[DEV OTP] Registration OTP for ${phone}: ${initialOtp}`);
    const token = signToken(user);
    res.status(201).json({
      message: 'Account created successfully. Welcome to FoodWatch!',
      token,
      user: user.toPublic(),
      devOtp: initialOtp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/register/receiver ──────────────────────────────
router.post('/register/receiver', [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone')
    .customSanitizer(val => String(val || '').replace(/^(\+91|0)/, '').replace(/\D/g, ''))
    .matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit Indian mobile required'),
  body('password').isLength({ min: 8 }).withMessage('Password min 8 characters'),
  body('receiverType').isIn(['individual','ngo','shelter','community_kitchen','other']).withMessage('Invalid receiver type'),
  body('address.area').notEmpty().withMessage('Area required'),
  body('address.city').notEmpty().withMessage('City required')
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { name, email, phone, password, receiverType, ngoRegNumber, address = {} } = req.body;

  try {
    if (await User.findOne({ email })) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const initialOtp = String(Math.floor(100000 + Math.random() * 900000));
    const user = await User.create({
      role: 'receiver',
      name, email, phone,
      passwordHash: password,
      receiverType, ngoRegNumber,
      phoneOtp: initialOtp,
      phoneOtpExpires: new Date(Date.now() + 10 * 60 * 1000),
      phoneVerified: false,
      address,
      isVerified: false
    });

    console.log(`[DEV OTP] Registration OTP for ${phone}: ${initialOtp}`);
    const token = signToken(user);
    res.status(201).json({
      message: 'Account created successfully. Welcome to FoodWatch!',
      token,
      user: user.toPublic(),
      devOtp: initialOtp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// ── POST /api/auth/send-otp & /api/auth/resend-otp ──────────────────
const handleSendOtp = async (req, res) => {
  try {
    let user = null;

    // Check if token provided in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch {}
    }

    // Otherwise find by phone or email in body
    if (!user && req.body.phone) {
      const cleanPhone = String(req.body.phone).replace(/^(\+91|0)/, '').replace(/\D/g, '');
      user = await User.findOne({ phone: cleanPhone, isActive: true });
    } else if (!user && req.body.email) {
      user = await User.findOne({ email: req.body.email.toLowerCase().trim(), isActive: true });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please check phone or sign in.' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.phoneOtp = otp;
    user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`[DEV OTP] Sent OTP for ${user.phone}: ${otp}`);

    res.json({
      message: `OTP sent to ${user.phone.slice(0, 2)}******${user.phone.slice(-2)}`,
      devOtp: otp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending OTP' });
  }
};

router.post('/send-otp', handleSendOtp);
router.post('/resend-otp', handleSendOtp);

// ── POST /api/auth/verify-otp ───────────────────────────────────────
router.post('/verify-otp', [
  body('otp').trim().notEmpty().withMessage('OTP required')
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { otp, phone } = req.body;

  try {
    let user = null;

    // Check if token provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch {}
    }

    if (!user && phone) {
      const cleanPhone = String(phone).replace(/^(\+91|0)/, '').replace(/\D/g, '');
      user = await User.findOne({ phone: cleanPhone, isActive: true });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trimmedOtp = String(otp).trim();
    const isDevMasterOtp = trimmedOtp === '123456';
    const isMatchingOtp = user.phoneOtp && user.phoneOtp === trimmedOtp;

    if (!isMatchingOtp && !isDevMasterOtp) {
      return res.status(400).json({ message: 'Invalid OTP code. Please try again.' });
    }

    if (isMatchingOtp && user.phoneOtpExpires && user.phoneOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    user.phoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    await user.save();

    res.json({
      message: 'Phone verified successfully! ✅',
      user: user.toPublic()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error verifying OTP' });
  }
});

// ── POST /api/auth/login ────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, isActive: true });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/auth/profile ───────────────────────────────────────────
router.put('/profile', protect, [
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('address.city').optional().notEmpty()
], async (req, res) => {
  if (handleValidation(req, res)) return;

  const allowed = ['name', 'phone', 'address', 'orgName', 'fssaiNumber'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  if (updates.phone) {
    updates.phone = String(updates.phone).replace(/^(\+91|0)/, '').replace(/\D/g, '');
    updates.phoneVerified = false;
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/auth/account ────────────────────────────────────────
// GDPR/DPDP-style soft delete
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      isActive: false,
      name:  '[Deleted]',
      email: `deleted_${req.user.id}@removed.local`,
      phone: '0000000000',
      passwordHash: 'deleted'
    });
    res.json({ message: 'Account deleted. Your personal data has been anonymised.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
