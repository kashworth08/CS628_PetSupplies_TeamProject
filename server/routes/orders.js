const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, admin } = require('../middleware/auth');

// Middleware to handle both authenticated and guest users
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If there's an auth header, use the auth middleware
    return auth(req, res, next);
  } else {
    // Otherwise, just continue without authentication
    next();
  }
};

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public (with session tracking)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo, totalAmount } = req.body;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    // Create a new order
    const newOrder = new Order({
      user: req.user ? req.user._id : null,
      sessionId: !req.user ? sessionId : null,
      items,
      shippingAddress,
      paymentInfo,
      totalAmount
    });
    
    const savedOrder = await newOrder.save();
    console.log(`Order created: ${savedOrder._id}`);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/me
// @desc    Get all orders for the current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/orders/session
// @desc    Get all orders for the current session
// @access  Public (with session tracking)
router.get('/session', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    const orders = await Order.find({ sessionId })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Get session orders error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Public (with authorization check)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    const sessionId = req.headers['x-session-id'];
    
    // Check if the order belongs to the user, session, or if the user is an admin
    if (
      (req.user && order.user && order.user.toString() === req.user._id.toString()) ||
      (req.user && req.user.role === 'admin') ||
      (sessionId && order.sessionId === sessionId)
    ) {
      return res.json(order);
    }
    
    return res.status(403).json({ msg: 'Not authorized' });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username email');
    
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin only)
// @access  Private/Admin
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Processing', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 