import api from './api';

export const TEN_SAMPLE_DONATIONS = [
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
    lat: 22.5726, lng: 88.3639
  }
];

export async function addSampleDonations(onProgress) {
  // Step 1: Try backend /donations/seed endpoint first
  try {
    const { data } = await api.post('/donations/seed');
    if (data?.count) return data;
  } catch (seedErr) {
    console.warn('Backend /seed endpoint not yet loaded or failed, falling back to client-side batch creation:', seedErr?.message);
  }

  // Step 2: Fallback — create donations one by one via POST /donations
  // First ensure we have a donor auth token
  let token = localStorage.getItem('fw_token');
  if (!token) {
    try {
      // Try login as demo donor
      const loginRes = await api.post('/auth/login', { email: 'donor@foodwatch.org', password: 'Password123!' });
      token = loginRes.data.token;
      localStorage.setItem('fw_token', token);
    } catch {
      // If login fails, register demo donor
      try {
        const regRes = await api.post('/auth/register/donor', {
          name: 'FoodWatch Community Kitchen',
          email: 'donor@foodwatch.org',
          phone: '9810123456',
          password: 'Password123!',
          donorType: 'restaurant',
          orgName: 'FoodWatch Kitchen Delhi',
          address: { line1: 'Connaught Place', area: 'Connaught Place', city: 'Delhi', state: 'Delhi', pincode: '110001' }
        });
        token = regRes.data.token;
        localStorage.setItem('fw_token', token);
      } catch (regErr) {
        console.error('Could not auto-authenticate demo donor:', regErr);
      }
    }
  }

  const now = new Date();
  const created = [];

  for (let i = 0; i < TEN_SAMPLE_DONATIONS.length; i++) {
    const item = TEN_SAMPLE_DONATIONS[i];
    onProgress && onProgress(i + 1, TEN_SAMPLE_DONATIONS.length, item.foodName);

    const preparedAt = new Date(now.getTime() - (1 + (i % 3)) * 3600000).toISOString();
    const pickupWindowStart = now.toISOString();
    const pickupWindowEnd = new Date(now.getTime() + Math.min(item.shelfLifeHours - 1, 4) * 3600000).toISOString();

    const payload = {
      foodName: item.foodName,
      category: item.category,
      description: item.description,
      ingredients: item.ingredients,
      allergens: JSON.stringify(item.allergens),
      storageInstructions: item.storageInstructions,
      quantity: item.quantity,
      quantityUnit: item.quantityUnit,
      preparedAt,
      shelfLifeHours: item.shelfLifeHours,
      pickupWindowStart,
      pickupWindowEnd,
      pickupAddress: item.pickupAddress,
      'pickupAddress[line1]': item.pickupAddress.line1,
      'pickupAddress[area]': item.pickupAddress.area,
      'pickupAddress[city]': item.pickupAddress.city,
      'pickupAddress[state]': item.pickupAddress.state,
      'pickupAddress[pincode]': item.pickupAddress.pincode,
      contactPhone: item.contactPhone,
      safetyAccepted: 'true',
      photoUrl: item.photoUrl,
      lat: item.lat,
      lng: item.lng
    };

    try {
      const { data } = await api.post('/donations', payload);
      created.push(data.donation);
    } catch (err) {
      console.error(`Failed to create donation ${item.foodName}:`, err?.response?.data || err.message);
    }
  }

  return { count: created.length, donations: created };
}
