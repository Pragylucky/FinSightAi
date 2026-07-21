// config/db.js
// Handles MongoDB connection using Mongoose
// Mongoose is an ODM (Object Document Mapper) — lets us write JS objects
// instead of raw MongoDB queries

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options suppress deprecation warnings
      // Mongoose 8.x handles these automatically, but good to be explicit
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    // Exit process on DB failure — no point running without a database
    process.exit(1);
  }
};

// Listen for connection events (useful for debugging)
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

module.exports = { connectDB };
