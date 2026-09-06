const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eslam_portfolio', {
      serverSelectionTimeoutMS: 5000 // 5 sec timeout fallback
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] Warning: Could not connect to MongoDB server (${error.message}).`);
    console.warn(`[Database] Running in Fallback / In-Memory cache mode for demonstration if needed.`);
    return false;
  }
};

module.exports = connectDB;
