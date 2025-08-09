// server/src/config/db.js
const mongoose = require('mongoose');
require('dotenv').config();


const url=process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(url , {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };