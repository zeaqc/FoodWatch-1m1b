const express = require('express');
const { body, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// ── Multer upload ──────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'), false);
    }
    cb(null, true);
  }
});

// ── Validation helper ──────────────────────────────────────────────
const check = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    const message = errorList.map(e => e.msg).filter(Boolean).join(', ') || 'Validation error';
    res.status(422).json({ message, errors: errorList });
    return true;
  }
  return false;
};

// Middleware to normalize multipart form fields
const normalizeDonationInput = (req, res, next) => {
  if (!req.body.pickupAddress || typeof req.body.pickupAddress !== 'object') {
    req.body.pickupAddress = {};
  }
  ['line1', 'area', 'city', 'state', 'pincode'].forEach(field => {
    if (req.body[`pickupAddress[${field}]`]) {
      req.body.pickupAddress[field] = req.body[`pickupAddress[${field}]`];
    } else if (req.body[`pickupAddress.${field}`]) {
      req.body.pickupAddress[field] = req.body[`pickupAddress.${field}`];
    }
  });
  next();
};

// ── POST /api/donations — create a new donation ────────────────────
router.post('/', protect, requireRole('donor'), upload.single('photo'), normalizeDonationInput, [
  body('foodName').trim().notEmpty().withMessage('Food name required').isLength({ max: 200 }),
  body('category').isIn(['veg', 'non_veg', 'vegan', 'packaged', 'cooked', 'raw_produce', 'dairy', 'bakery', 'other']),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be > 0').toFloat(),
  body('quantityUnit').optional().isIn(['servings', 'kg', 'litres', 'pieces', 'boxes', 'packets']),
  body('preparedAt').isISO8601().withMessage('Valid prepared datetime required').toDate(),
  body('shelfLifeHours').isFloat({ min: 0.5, max: 120 }).withMessage('Shelf life 0.5–120 hours').toFloat(),
  body('pickupWindowStart').isISO8601().toDate(),
  body('pickupWindowEnd').isISO8601().toDate(),
  body('pickupAddress.line1').notEmpty().withMessage('Pickup address required'),
  body('pickupAddress.city').notEmpty().withMessage('City required'),
  body('contactPhone')
    .customSanitizer(val => String(val || '').replace(/^(\+91|0)/, '').replace(/\D/g, ''))
    .matches(/^[6-9]\d{9}$/).withMessage('Valid contact phone required'),
  body('safetyAccepted').equals('true').withMessage('Must accept safety disclaimer')
], async (req, res) => {
  if (check(req, res)) return;

  const {
    foodName, category, description, ingredients, allergens,
    storageInstructions, quantity, quantityUnit,
    preparedAt, shelfLifeHours, pickupWindowStart, pickupWindowEnd,
    pickupAddress, contactPhone, lat, lng
  } = req.body;

  // ── Business rule: preparedAt cannot be in the future ─────────
  if (new Date(preparedAt) > new Date()) {
    return res.status(422).json({ message: 'Prepared time cannot be in the future' });
  }

  const expiresAt = new Date(new Date(preparedAt).getTime() + shelfLifeHours * 60 * 60 * 1000);

  try {
    // ── Handle photo upload ─────────────────────────────────────
    let photoUrl = null;
    if (req.file) {
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
      const dest = path.join(uploadDir, filename);
      await sharp(req.file.buffer)
        .resize(800, 600, { fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(dest);
      photoUrl = `/uploads/${filename}`;
    }

    let parsedAllergens = [];
    if (Array.isArray(allergens)) {
      parsedAllergens = allergens;
    } else if (typeof allergens === 'string' && allergens.trim()) {
      try { parsedAllergens = JSON.parse(allergens); } catch { }
    }

    const donationData = {
      donor: req.user.id,
      foodName, category, description, ingredients,
      allergens: parsedAllergens,
      storageInstructions,
      quantity, quantityUnit: quantityUnit || 'servings',
      preparedAt, shelfLifeHours, expiresAt,
      pickupWindowStart, pickupWindowEnd,
      pickupAddress: req.body.pickupAddress || {},
      contactPhone,
      photoUrl,
      safetyAccepted: true,
      safetyAcceptedAt: new Date(),
      sdgTags: ['SDG2', 'SDG12']
    };

    // Add geo if provided
    if (lat && lng) {
      donationData.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      };
    }

    const donation = await Donation.create(donationData);

    // Update donor stats
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDonated: 1 } });

    res.status(201).json({ donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating donation' });
  }
});

// ── GET /api/donations — list available donations (public with filters) ──
router.get('/', async (req, res) => {
  const {
    status = 'available',
    category,
    city,
    area,
    lat, lng, radius = 10000,   // metres
    page = 1,
    limit = 20
  } = req.query;

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
    if (status === 'available' && req.query.includeExpired !== 'true') {
      filter.expiresAt = { $gt: new Date() };
    }
  } else if (req.query.includeExpired !== 'true' && !status) {
    filter.expiresAt = { $gt: new Date() };
  }

  if (category) filter.category = category;
  if (city) filter['pickupAddress.city'] = new RegExp(city, 'i');
  if (area) filter['pickupAddress.area'] = new RegExp(area, 'i');

  // Geo-near query takes priority over city/area filters
  let useGeo = false;
  if (lat && lng) {
    useGeo = true;
  }

  try {
    let donations;
    const skip = (Number(page) - 1) * Number(limit);

    if (useGeo) {
      donations = await Donation.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: Number(radius)
          }
        }
      })
        .select('-reports')
        .populate('donor', 'name orgName donorType avatarUrl')
        .skip(skip)
        .limit(Number(limit));
    } else {
      donations = await Donation.find(filter)
        .select('-reports')
        .populate('donor', 'name orgName donorType avatarUrl')
        .sort({ expiresAt: 1 })
        .skip(skip)
        .limit(Number(limit));
    }

    const total = await Donation.countDocuments(filter);

    res.json({ donations, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching donations' });
  }
});

// ── GET /api/donations/my — donor's own donations ─────────────────
router.get('/my', protect, requireRole('donor'), async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { donor: req.user.id };
  if (status) filter.status = status;

  try {
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Donation.countDocuments(filter);
    res.json({ donations, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/donations/:id — single donation ──────────────────────
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .select('-reports')
      .populate('donor', 'name orgName donorType avatarUrl phone');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/donations/:id — update (donor only, only if available) ──
router.put('/:id', protect, requireRole('donor'), async (req, res) => {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user.id });
    if (!donation) return res.status(404).json({ message: 'Donation not found or not yours' });
    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Cannot edit a donation that has been claimed or expired' });
    }

    const allowed = ['description', 'storageInstructions', 'allergens',
      'pickupWindowStart', 'pickupWindowEnd', 'contactPhone'];
    allowed.forEach(k => { if (req.body[k] !== undefined) donation[k] = req.body[k]; });
    await donation.save();
    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/donations/:id — remove (donor or admin) ───────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, donor: req.user.id };

    const donation = await Donation.findOne(filter);
    if (!donation) return res.status(404).json({ message: 'Not found or not authorised' });
    if (donation.status === 'claimed') {
      return res.status(400).json({ message: 'Cannot delete a claimed donation. Cancel the claim first.' });
    }

    donation.status = 'removed';
    donation.removedBy = req.user.id;
    donation.removalReason = req.body.reason || 'User removed';
    await donation.save();
    res.json({ message: 'Donation removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/donations/:id/report — report unsafe food ───────────
router.post('/:id/report', protect, [
  body('reason').trim().notEmpty().withMessage('Reason required').isLength({ max: 500 })
], async (req, res) => {
  if (check(req, res)) return;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });

    donation.reports.push({ reportedBy: req.user.id, reason: req.body.reason });
    donation.reportCount = donation.reports.length;

    // Auto-remove if 3+ reports
    if (donation.reportCount >= 3) {
      donation.status = 'removed';
      donation.removalReason = 'Auto-removed after 3+ reports';
    }

    await donation.save();
    res.json({ message: 'Report submitted successfully', reportCount: donation.reportCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/donations/seed — seed 10 sample donations ───────────
router.post('/seed', async (req, res) => {
  try {
    let donor = await User.findOne({ role: 'donor', isActive: true });
    if (!donor) {
      donor = await User.create({
        role: 'donor',
        name: 'FoodWatch Community Kitchen',
        email: 'donor@foodwatch.org',
        phone: '9810123456',
        passwordHash: 'seeded_donor_hash',
        donorType: 'restaurant',
        orgName: 'FoodWatch Kitchen Delhi',
        phoneVerified: true,
        isVerified: true,
        address: { line1: 'Connaught Place', area: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' }
      });
    }

    const now = new Date();
    const samples = [
      {
        foodName: 'Dal Makhani & Butter Naan',
        category: 'cooked',
        description: 'Freshly prepared dal makhani, butter naan, and jeera rice from wedding luncheon banquet.',
        ingredients: 'Black lentils, butter, cream, refined flour, basmati rice, spices',
        allergens: ['dairy', 'gluten'],
        storageInstructions: 'Keep warm in hot case or reheat thoroughly before consumption',
        quantity: 80,
        quantityUnit: 'servings',
        shelfLifeHours: 6,
        pickupAddress: { line1: 'Hotel Royal Palace, Karol Bagh', area: 'Karol Bagh', city: 'Delhi', state: 'Delhi', pincode: '110005' },
        contactPhone: '9810123456',
        photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
        sdgTags: ['SDG2', 'SDG12'],
        lat: 28.6519, lng: 77.1925
      },
      {
        foodName: 'Chole Bhature (Bulk Catering)',
        category: 'cooked',
        description: 'Surplus from lunch service — hot spiced chickpea curry and fresh puffy bhature. 50 full meals.',
        ingredients: 'Chickpeas, flour, onions, tomatoes, ginger, spices, vegetable oil',
        allergens: ['gluten'],
        storageInstructions: 'Store in insulated containers, consume within 4 hours',
        quantity: 50,
        quantityUnit: 'servings',
        shelfLifeHours: 5,
        pickupAddress: { line1: 'Block A, Connaught Place', area: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' },
        contactPhone: '9811234567',
        photoUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80',
        sdgTags: ['SDG2', 'SDG3'],
        lat: 28.6315, lng: 77.2167
      },
      {
        foodName: 'Mixed Vegetable Biryani & Raita',
        category: 'veg',
        description: 'Home-cooked fragrant basmati rice biryani with garden vegetables, served with cucumber raita.',
        ingredients: 'Basmati rice, carrots, peas, potatoes, beans, curd, saffron, mint',
        allergens: ['dairy'],
        storageInstructions: 'Keep in cool area, consume within 5 hours',
        quantity: 35,
        quantityUnit: 'servings',
        shelfLifeHours: 8,
        pickupAddress: { line1: 'Central Market, Lajpat Nagar II', area: 'Lajpat Nagar', city: 'Delhi', state: 'Delhi', pincode: '110024' },
        contactPhone: '9312345678',
        photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
        sdgTags: ['SDG2', 'SDG12'],
        lat: 28.5665, lng: 77.2432
      },
      {
        foodName: 'Mumbai Pav Bhaji (Community Batch)',
        category: 'veg',
        description: 'Hot, buttery spiced vegetable mash with 200 fresh pavs. Prepared for event.',
        ingredients: 'Potatoes, tomatoes, peas, butter, pav bread, capsicum, onions',
        allergens: ['dairy', 'gluten'],
        storageInstructions: 'Reheat bhaji before serving',
        quantity: 100,
        quantityUnit: 'servings',
        shelfLifeHours: 4.5,
        pickupAddress: { line1: 'Juhu Beach Road', area: 'Juhu', city: 'Mumbai', state: 'Maharashtra', pincode: '400049' },
        contactPhone: '9820123456',
        photoUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80',
        sdgTags: ['SDG2', 'SDG11'],
        lat: 19.1003, lng: 72.8271
      },
      {
        foodName: 'South Indian Idli & Sambar Combo',
        category: 'veg',
        description: 'Corporate breakfast surplus — 120 fluffy steamed idlis, fresh coconut chutney and piping hot sambar.',
        ingredients: 'Rice, urad dal, lentils, drumsticks, tamarind, coconut',
        allergens: [],
        storageInstructions: 'Consume warm, keep chutney refrigerated',
        quantity: 120,
        quantityUnit: 'pieces',
        shelfLifeHours: 6,
        pickupAddress: { line1: 'BKC Corporate Park, G Block', area: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051' },
        contactPhone: '9821234567',
        photoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
        sdgTags: ['SDG2', 'SDG3'],
        lat: 19.0607, lng: 72.8656
      },
      {
        foodName: 'Hyderabadi Chicken Biryani & Salan',
        category: 'non_veg',
        description: 'Authentic dum biryani made with tender chicken, long grain basmati rice, served with mirchi ka salan.',
        ingredients: 'Chicken, basmati rice, yoghurt, onions, mint, green chillies, aromatic spices',
        allergens: ['dairy'],
        storageInstructions: 'Keep in warm containers, reheat thoroughly',
        quantity: 50,
        quantityUnit: 'servings',
        shelfLifeHours: 5,
        pickupAddress: { line1: 'Old City, near Charminar', area: 'Charminar', city: 'Hyderabad', state: 'Telangana', pincode: '500002' },
        contactPhone: '9963123456',
        photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
        sdgTags: ['SDG2'],
        lat: 17.3616, lng: 78.4741
      },
      {
        foodName: 'South Indian Thali Meals',
        category: 'veg',
        description: 'Complete balanced vegetarian thali meals with steamed rice, sambar, rasam, kootu, poriyal, and curd.',
        ingredients: 'Rice, lentils, mixed seasonal vegetables, tamarind, mustard, curry leaves, curd',
        allergens: ['dairy'],
        storageInstructions: 'Eat within 4 hours of pickup',
        quantity: 45,
        quantityUnit: 'servings',
        shelfLifeHours: 6,
        pickupAddress: { line1: '80 Feet Road, Koramangala 4th Block', area: 'Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        contactPhone: '9880123456',
        photoUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&q=80',
        sdgTags: ['SDG2', 'SDG3', 'SDG12'],
        lat: 12.9352, lng: 77.6245
      },
      {
        foodName: 'Fresh Organic Farm Produce Basket',
        category: 'raw_produce',
        description: 'Crisp organic vegetables: ripe tomatoes, fresh spinach, cucumbers, capsicum, and carrots from weekend farmers market.',
        ingredients: 'Fresh whole tomatoes, spinach, cucumber, bell pepper, carrots',
        allergens: [],
        storageInstructions: 'Store in cool ventilated space or refrigerator',
        quantity: 30,
        quantityUnit: 'kg',
        shelfLifeHours: 48,
        pickupAddress: { line1: '100 Feet Road, Indiranagar', area: 'Indiranagar', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
        contactPhone: '9881234567',
        photoUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&q=80',
        sdgTags: ['SDG2', 'SDG12'],
        lat: 12.9784, lng: 77.6408
      },
      {
        foodName: 'Artisan Bakery Loaves & Buns',
        category: 'bakery',
        description: 'Day-end surplus from artisan bakery — whole wheat loaves, multigrain sandwich bread, and milk buns. Untouched and packaged.',
        ingredients: 'Whole wheat flour, yeast, water, olive oil, seeds',
        allergens: ['gluten'],
        storageInstructions: 'Store in dry place at room temperature',
        quantity: 40,
        quantityUnit: 'packets',
        shelfLifeHours: 36,
        pickupAddress: { line1: 'Park Street Cross, near Metro', area: 'Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
        contactPhone: '9831123456',
        photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
        sdgTags: ['SDG2', 'SDG12'],
        lat: 22.5534, lng: 88.3512
      },
      {
        foodName: 'Fresh Mishti Doi & Sandesh Sweets',
        category: 'dairy',
        description: 'Traditional Bengali sweet shop surplus: creamy mishti doi earthen pots and delicate cottage-cheese sandesh.',
        ingredients: 'Milk, sugar, cardamom, saffron, curd culture',
        allergens: ['dairy'],
        storageInstructions: 'Keep strictly refrigerated at 4°C',
        quantity: 60,
        quantityUnit: 'pieces',
        shelfLifeHours: 24,
        pickupAddress: { line1: 'College Street Market', area: 'College Street', city: 'Kolkata', state: 'West Bengal', pincode: '700073' },
        contactPhone: '9832234567',
        photoUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80',
        sdgTags: ['SDG2', 'SDG3'],
        lat: 22.5726, lng: 88.3639
      }
    ];

    const toInsert = samples.map((d, index) => {
      const preparedAt = new Date(now.getTime() - (1 + (index % 3)) * 3600000);
      const expiresAt = new Date(preparedAt.getTime() + d.shelfLifeHours * 3600000);
      const pickupWindowStart = now;
      const pickupWindowEnd = new Date(now.getTime() + Math.min(d.shelfLifeHours - 1, 4) * 3600000);

      return {
        donor: donor._id,
        foodName: d.foodName,
        category: d.category,
        description: d.description,
        ingredients: d.ingredients,
        allergens: d.allergens,
        storageInstructions: d.storageInstructions,
        quantity: d.quantity,
        quantityUnit: d.quantityUnit,
        preparedAt,
        shelfLifeHours: d.shelfLifeHours,
        expiresAt,
        pickupWindowStart,
        pickupWindowEnd,
        pickupAddress: d.pickupAddress,
        location: {
          type: 'Point',
          coordinates: [d.lng, d.lat]
        },
        contactPhone: d.contactPhone,
        photoUrl: d.photoUrl,
        status: 'available',
        safetyAccepted: true,
        safetyAcceptedAt: now,
        sdgTags: d.sdgTags
      };
    });

    const created = await Donation.insertMany(toInsert);
    await User.findByIdAndUpdate(donor._id, { $inc: { totalDonated: created.length } });

    res.status(201).json({
      message: `Successfully seeded ${created.length} donations!`,
      count: created.length,
      donations: created
    });
  } catch (err) {
    console.error('Seeding error:', err);
    res.status(500).json({ message: 'Error seeding donations', error: err.message });
  }
});

module.exports = router;