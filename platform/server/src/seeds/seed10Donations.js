require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../utils/db');
const User = require('../models/User');
const Donation = require('../models/Donation');

const SAMPLE_DONATIONS = [
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

async function seed() {
  console.log('🌱 Connecting to database...');
  await connectDB();

  // Find or create donor
  let donor = await User.findOne({ role: 'donor', isActive: true });
  if (!donor) {
    console.log('Creating demo donor account...');
    donor = await User.create({
      role: 'donor',
      name: 'FoodWatch Community Kitchen',
      email: 'donor@foodwatch.org',
      phone: '9810123456',
      passwordHash: 'seeded_donor_pwd_hash',
      donorType: 'restaurant',
      orgName: 'FoodWatch Kitchen & Catering',
      phoneVerified: true,
      isVerified: true,
      address: { line1: 'Connaught Place', area: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' }
    });
  }

  console.log(`Using donor: ${donor.name} (${donor.email})`);

  const now = new Date();
  const donationsToInsert = SAMPLE_DONATIONS.map((d, index) => {
    const preparedAt = new Date(now.getTime() - (1 + (index % 3)) * 3600000); // 1-3 hrs ago
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

  const created = await Donation.insertMany(donationsToInsert);
  await User.findByIdAndUpdate(donor._id, { $inc: { totalDonated: created.length } });

  console.log(`✅ Successfully added ${created.length} donations!`);
  created.forEach((d, i) => {
    console.log(`  ${i + 1}. [${d.category}] ${d.foodName} - ${d.quantity} ${d.quantityUnit} in ${d.pickupAddress.city}`);
  });

  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
