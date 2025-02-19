// models/User.js
/* const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: { type: String, unique: true, required: true },
  Password: { type: String, required: true },
  FirstName: String,
  LastName: String,
  Address: String,
  Role: { type: String, enum: ["customer", "admin"], default: "customer" },
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema); */ 
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4, // Generates a unique ID using uuidv4
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/, // Basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  address: {
    type: String,
    required: true,
    maxlength: 100,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, { timestamps: true });

// Pre-save hook to hash passwords
UserSchema.pre('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 
