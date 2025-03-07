require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Check if admin user exists and create one if it doesn't
const checkAdminUser = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@petsupplies.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Email: admin@petsupplies.com');
      console.log('Role:', adminExists.role);
      return;
    }
    
    // Create new admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@petsupplies.com',
      password: 'Admin123!',
      address: 'Admin Office',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@petsupplies.com');
    console.log('Password: Admin123!');
  } catch (err) {
    console.error('Error checking/creating admin user:', err.message);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the script
connectDB().then(() => {
  checkAdminUser();
}); 