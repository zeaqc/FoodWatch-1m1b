require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const path    = require('path');
const rateLimit = require('express-rate-limit');

const connectDB   = require('./utils/db');
const authRoutes  = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const claimRoutes = require('./routes/claims');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const impactRoutes = require('./routes/impact');
const { startExpiryJob } = require('./jobs/expiryJob');

const app = express();

// ── Security middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 50000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.path.startsWith('/api/impact')
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000,
  message: { message: 'Too many auth attempts. Try again in 15 minutes.' }
});


// ── Body parsers ───────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads & artifacts ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));
const brainDir = 'C:/Users/pranjal/.gemini/antigravity-ide/brain/6f9e006d-d27a-4c9e-98b8-21c9f92e02a1';
app.use('/artifacts', express.static(brainDir));

// Ensure 3D images are in client/public
const fs = require('fs');
try {
  const clientPublic = path.join(__dirname, '..', '..', 'client', 'public');
  if (fs.existsSync(brainDir)) {
    fs.copyFileSync(path.join(brainDir, 'food_problem_3d_1789918458480.jpg'), path.join(clientPublic, 'food_problem_3d.jpg'));
    fs.copyFileSync(path.join(brainDir, 'food_rescue_3d_1789918428588.jpg'), path.join(clientPublic, 'food_rescue_3d.jpg'));
    fs.copyFileSync(path.join(brainDir, 'foodwatch_hero_bg_1789924460429.jpg'), path.join(clientPublic, 'foodwatch_hero_bg.jpg'));
  }
} catch (e) {}

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/claims',    claimRoutes);
app.use('/api/ratings',   ratingRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/impact',    impactRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ── Serve React frontend in production ────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const status  = err.status  || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  startExpiryJob();
});

module.exports = app; // for tests
