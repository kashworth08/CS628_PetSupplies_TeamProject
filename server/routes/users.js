const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password, address } = req.body;

  // Basic validation
  if (!username || !email || !password || !address) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      address,
    });

    const savedUser = await newUser.save();

    // Respond with user data (excluding password)
    res.status(201).json({
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        address: savedUser.address,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 