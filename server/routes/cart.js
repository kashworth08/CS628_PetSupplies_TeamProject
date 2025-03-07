const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Helper function to get cart by user ID or session ID
const getCart = async (userId, sessionId) => {
  let cart;
  
  if (userId) {
    // Try to find cart by user ID first
    cart = await Cart.findOne({ user: userId });
  }
  
  if (!cart && sessionId) {
    // If no cart found by user ID, try to find by session ID
    cart = await Cart.findOne({ sessionId });
  }
  
  return cart;
};

// Helper function to merge carts (guest cart into user cart)
const mergeCarts = async (userCart, guestCart) => {
  if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
    return userCart;
  }
  
  if (!userCart) {
    // If user doesn't have a cart, convert the guest cart to a user cart
    guestCart.user = guestCart.sessionId;
    delete guestCart.sessionId;
    await guestCart.save();
    return guestCart;
  }
  
  // Merge items from guest cart into user cart
  for (const guestItem of guestCart.items) {
    const existingItemIndex = userCart.items.findIndex(
      item => item.product.toString() === guestItem.product.toString()
    );
    
    if (existingItemIndex >= 0) {
      // If item already exists in user cart, update quantity
      userCart.items[existingItemIndex].quantity += guestItem.quantity;
    } else {
      // Otherwise, add the item to user cart
      userCart.items.push(guestItem);
    }
  }
  
  userCart.updatedAt = Date.now();
  await userCart.save();
  
  // Delete the guest cart
  await Cart.findByIdAndDelete(guestCart._id);
  
  return userCart;
};

// Middleware to ensure a session ID
const ensureSessionId = (req, res, next) => {
  if (!req.headers['x-session-id']) {
    // Generate a new session ID if none exists
    req.headers['x-session-id'] = uuidv4();
    res.setHeader('X-Session-Id', req.headers['x-session-id']);
  }
  next();
};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Public (with session tracking)
router.get('/', ensureSessionId, async (req, res) => {
  try {
    console.log('GET /api/cart - Request received');
    console.log('Headers:', req.headers);
    
    const userId = req.user ? req.user.id : null;
    const sessionId = req.headers['x-session-id'];
    
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    
    if (!sessionId) {
      console.log('No session ID provided');
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    console.log('Attempting to get cart for user/session');
    let cart = await getCart(userId, sessionId);
    
    console.log('Cart found:', !!cart);
    
    if (!cart) {
      console.log('No cart found, creating a new one');
      // Create a new cart if none exists
      cart = new Cart({
        user: userId,
        sessionId,
        items: []
      });
      await cart.save();
      console.log('New cart created:', cart._id.toString());
    } else {
      console.log('Existing cart found:', cart._id.toString());
      console.log('Cart items count:', cart.items.length);
    }
    
    // Populate product details
    if (cart.items.length > 0) {
      console.log('Populating product details');
      await cart.populate('items.product', 'Name Description Price Stock');
      console.log('Product details populated');
    }
    
    console.log('Sending cart response');
    res.json(cart);
  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart with user cart after login
// @access  Private
router.post('/merge', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }
    
    // Find user cart and guest cart
    const userCart = await Cart.findOne({ user: userId });
    const guestCart = await Cart.findOne({ sessionId });
    
    if (!guestCart) {
      // If no guest cart, just return the user cart (or create one)
      const cart = userCart || new Cart({ user: userId, items: [] });
      await cart.save();
      
      await cart.populate({
        path: 'items.product',
        select: 'Name Price Description Stock'
      });
      
      return res.json(cart);
    }
    
    // Merge carts
    const mergedCart = await mergeCarts(userCart, guestCart);
    
    await mergedCart.populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    res.json(mergedCart);
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Public (with session tracking)
router.post('/', ensureSessionId, async (req, res) => {
  try {
    console.log('POST /api/cart - Request received');
    console.log('Request body:', req.body);
    
    const { productId, quantity } = req.body;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    
    console.log('User ID:', userId);
    console.log('Session ID:', sessionId);
    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found');
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if quantity is valid
    if (quantity <= 0) {
      console.log('Invalid quantity');
      return res.status(400).json({ msg: 'Quantity must be greater than 0' });
    }
    
    // Check if product is in stock
    if (product.Stock < quantity) {
      console.log('Not enough items in stock');
      return res.status(400).json({ msg: 'Not enough items in stock' });
    }
    
    // Get or create cart
    console.log('Getting cart');
    let cart = await getCart(userId, sessionId);
    
    if (!cart) {
      console.log('Creating new cart');
      cart = new Cart({
        user: userId || null,
        sessionId: !userId ? sessionId : null,
        items: []
      });
    }
    
    // Check if product already in cart
    console.log('Checking if product already in cart');
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      console.log('Product already in cart, updating quantity');
      // Instead of incrementing, set to the exact quantity requested
      // This prevents double-adding when the client sends multiple requests
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new item to cart
      console.log('Adding new item to cart');
      cart.items.push({
        product: productId,
        quantity
      });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    console.log('Cart saved');
    
    // Populate product details
    console.log('Populating product details');
    await cart.populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    console.log('Sending response');
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update item quantity in cart
// @access  Public (with session tracking)
router.put('/:productId', ensureSessionId, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ msg: 'Quantity must be greater than 0' });
    }
    
    // Get cart
    let cart = await getCart(userId, sessionId);
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    // Find item in cart
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    // Check if product is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    if (product.Stock < quantity) {
      return res.status(400).json({ msg: 'Not enough items in stock' });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/cart/:productId
// @desc    Remove item from cart
// @access  Public (with session tracking)
router.delete('/:productId', ensureSessionId, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    
    // Get cart
    let cart = await getCart(userId, sessionId);
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details
    await cart.populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Public (with session tracking)
router.delete('/', ensureSessionId, async (req, res) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.headers['x-session-id'];
    
    // Get cart
    let cart = await getCart(userId, sessionId);
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    // Clear cart items
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 