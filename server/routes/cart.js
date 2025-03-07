const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if quantity is valid
    if (quantity <= 0) {
      return res.status(400).json({ msg: 'Quantity must be greater than 0' });
    }
    
    // Check if product is in stock
    if (product.Stock < quantity) {
      return res.status(400).json({ msg: 'Not enough items in stock' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity }]
      });
    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(item => 
        item.product.toString() === productId
      );
      
      if (itemIndex > -1) {
        // Update quantity if product exists
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Add new item if product doesn't exist in cart
        cart.items.push({ product: productId, quantity });
      }
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before sending response
    await cart.populate({
      path: 'items.product',
      select: 'Name Price Description Stock'
    });
    
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/cart/:productId
// @desc    Update item quantity in cart
// @access  Private
router.put('/:productId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const productId = req.params.productId;
    
    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ msg: 'Quantity must be greater than 0' });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if product is in stock
    if (product.Stock < quantity) {
      return res.status(400).json({ msg: 'Not enough items in stock' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    // Find the item in the cart
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Item not found in cart' });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    // Populate product details before sending response
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
// @access  Private
router.delete('/:productId', auth, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate product details before sending response
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
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    
    await cart.save();
    
    res.json({ msg: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 