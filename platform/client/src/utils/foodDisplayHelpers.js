// FoodWatch — Food Display & Mock Donor Helpers

export const MOCK_DONORS = [
  { name: 'Taj West End Banquets', type: 'Luxury Banquets & Hospitality', badge: 'Verified Partner' },
  { name: 'The Oberoi Grand Kitchens', type: 'Five Star Hotel Kitchen', badge: 'Zero Waste Champion' },
  { name: 'Saffron & Thyme Catering', type: 'Premium Event Caterer', badge: 'Top Contributor' },
  { name: 'ITC Gardenia Culinary Hub', type: 'Sustainable Food Service', badge: 'Certified Partner' },
  { name: 'Paradise Food Court', type: 'Restaurant & Banquet Hall', badge: 'Verified Partner' },
  { name: 'Haldiram’s Fresh Kitchens', type: 'Commercial Kitchen & Retail', badge: 'Daily Donor' },
  { name: 'Bikanervala Convention Hall', type: 'Event & Wedding Catering', badge: 'Verified Partner' },
  { name: 'Green Leaf Organic Kitchen', type: 'Farm-to-Table Kitchen', badge: 'Organic Certified' },
  { name: 'Royal Orchid Convention Hall', type: 'Corporate Banquets', badge: 'Verified Partner' },
  { name: 'Anand Sweets & Confectionery', type: 'Artisan Sweet & Savoury Hub', badge: 'Daily Donor' },
  { name: 'Barbeque Nation Surplus Cell', type: 'Multi-Cuisine Restaurant', badge: 'Zero Hunger Ally' },
  { name: 'Adyar Ananda Bhavan (A2B)', type: 'Heritage Pure Veg Kitchen', badge: 'Verified Partner' },
  { name: 'Subway Fresh Forward Hub', type: 'Fresh Food Kitchen', badge: 'Daily Contributor' },
  { name: 'Copper Chimney Banquets', type: 'Fine Dining & Catering', badge: 'Verified Partner' },
  { name: 'Chowman Asian Kitchens', type: 'Regional Restaurant Group', badge: 'Verified Partner' }
];

export const CITY_COORDINATES = {
  'delhi': [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  'mumbai': [19.0760, 72.8777],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
  'kolkata': [22.5726, 88.3639],
  'chennai': [13.0827, 80.2707],
  'pune': [18.5204, 73.8567],
  'jaipur': [26.9124, 75.7873],
  'ahmedabad': [23.0225, 72.5714]
};

// Curated high-resolution appetizing food images
export const FOOD_NAME_IMAGES = {
  'dal makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  'chole bhature': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
  'pav bhaji': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80',
  'idli': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
  'thali': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
  'produce': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
  'farm': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  'sweets': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  'mishti': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  'doi': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80'
};

export const CATEGORY_FALLBACK_IMAGES = {
  cooked: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
  veg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  non_veg: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
  vegan: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  raw_produce: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800&auto=format&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  packaged: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=800&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80'
};

/**
 * Returns a guaranteed high quality picture for a given donation
 */
export function getFoodImage(donation) {
  if (donation?.photoUrl && donation.photoUrl.trim() !== '') {
    return donation.photoUrl;
  }

  const name = (donation?.foodName || '').toLowerCase();
  for (const [key, url] of Object.entries(FOOD_NAME_IMAGES)) {
    if (name.includes(key)) return url;
  }

  const cat = donation?.category || 'cooked';
  return CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES.other;
}

/**
 * Deterministically assigns a realistic mock donor name to a donation
 */
export function getDonorInfo(donation) {
  const existingOrg = donation?.donor?.orgName;
  const existingName = donation?.donor?.name;

  const isGeneric = !existingOrg && (!existingName || 
    existingName.toLowerCase() === 'john oe' || 
    existingName.toLowerCase() === 'donor' || 
    existingName.toLowerCase().includes('test'));

  if (!isGeneric && (existingOrg || existingName)) {
    return {
      name: existingOrg || existingName,
      type: donation?.donor?.donorType === 'restaurant' ? 'Restaurant & Catering' : 'Verified Food Partner',
      badge: 'Verified Donor'
    };
  }

  const seed = donation?._id || donation?.foodName || 'foodwatch';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % MOCK_DONORS.length;
  return MOCK_DONORS[idx];
}

/**
 * Returns [lat, lng] coordinates for Leaflet Map
 */
export function getDonationCoordinates(donation) {
  // 1. Check GeoJSON location: [lng, lat]
  if (donation?.location?.coordinates && donation.location.coordinates.length === 2) {
    const lng = Number(donation.location.coordinates[0]);
    const lat = Number(donation.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return [lat, lng];
    }
  }

  // 2. Check lat / lng properties if directly present
  if (donation?.lat && donation?.lng) {
    return [Number(donation.lat), Number(donation.lng)];
  }

  // 3. Fallback to city coordinates with deterministic micro-jitter so multiple donations in the same city don't completely overlap
  const city = (donation?.pickupAddress?.city || '').toLowerCase().trim();
  const baseCoords = CITY_COORDINATES[city] || [28.6139, 77.2090]; // Default to Delhi

  const seed = donation?._id || 'jitter';
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const jitterLat = ((hash % 100) / 1000) * 0.04;
  const jitterLng = (((hash >> 2) % 100) / 1000) * 0.04;

  return [baseCoords[0] + jitterLat, baseCoords[1] + jitterLng];
}
