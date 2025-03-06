const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, admin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, async (req, res) => {
  const { username, email, password, address } = req.body;

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

    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Respond with user data and token
    res.status(201).json({
      token,
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

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        msg: 'User does not exist',
        field: 'email',
        errorType: 'user_not_found'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        msg: 'Invalid password',
        field: 'password',
        errorType: 'invalid_password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    // Log successful login
    console.log(`User logged in: ${user.email} (${user.role})`);

    // Respond with user data and token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error', errorType: 'server_error' });
  }
});

// @route   GET /api/users/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      address: req.user.address,
      role: req.user.role,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    })));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  const { username, email, role, address } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (address) user.address = address;

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: 'User removed' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 