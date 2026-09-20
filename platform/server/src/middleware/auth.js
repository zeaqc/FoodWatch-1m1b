const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: verify JWT from Authorization: Bearer <token>
 * Attaches req.user = { id, role }
 */
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorisation denied' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

/**
 * Middleware: restrict to specific roles
 * Usage: requireRole('admin') or requireRole('donor', 'receiver')
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

/**
 * Middleware: ensure phone is verified before sensitive actions
 */
const requirePhoneVerified = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('phoneVerified');
  if (!user || !user.phoneVerified) {
    return res.status(403).json({ message: 'Phone number not verified. Please verify via OTP first.' });
  }
  next();
};

module.exports = { protect, requireRole, requirePhoneVerified };
