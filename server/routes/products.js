const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('CategoryID', 'Name');
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('CategoryID', 'Name');
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
  const { Name, Description, CategoryID, Price, Stock } = req.body;
  
  try {
    // Check if category exists
    const category = await Category.findById(CategoryID);
    if (!category) {
      return res.status(400).json({ msg: 'Category not found' });
    }
    
    const newProduct = new Product({
      Name,
      Description,
      CategoryID,
      Price,
      Stock
    });
    
    const product = await newProduct.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  const { Name, Description, CategoryID, Price, Stock } = req.body;
  
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // If category is being updated, check if new category exists
    if (CategoryID && CategoryID !== product.CategoryID.toString()) {
      const category = await Category.findById(CategoryID);
      if (!category) {
        return res.status(400).json({ msg: 'Category not found' });
      }
    }
    
    // Update fields
    if (Name) product.Name = Name;
    if (Description !== undefined) product.Description = Description;
    if (CategoryID) product.CategoryID = CategoryID;
    if (Price !== undefined) product.Price = Price;
    if (Stock !== undefined) product.Stock = Stock;
    
    await product.save();
    
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get('/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ CategoryID: req.params.categoryId }).populate('CategoryID', 'Name');
    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 