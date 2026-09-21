const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodwatch';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', err.message);
    console.warn('💡 Tip: Start local MongoDB or set MONGO_URI in platform/server/.env. Server will keep running.');
  }
};

module.exports = connectDB;
