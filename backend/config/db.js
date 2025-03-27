const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ChaosCoders');
    console.log('MongoDB Connected Successfully to ChaosCoders');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};
module.exports = connectDB;