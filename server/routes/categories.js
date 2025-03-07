const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth, admin } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a category
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
  const { name, description, parentCategory } = req.body;
  
  try {
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    
    if (existingCategory) {
      return res.status(400).json({ msg: 'Category already exists' });
    }
    
    // Create new category
    const newCategory = new Category({
      name,
      description,
      parentCategory
    });
    
    const category = await newCategory.save();
    
    res.json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  const { name, description, parentCategory } = req.body;
  
  // Build category object
  const categoryFields = {};
  if (name) categoryFields.name = name;
  if (description) categoryFields.description = description;
  if (parentCategory) categoryFields.parentCategory = parentCategory;
  
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Update
    category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: categoryFields },
      { new: true }
    );
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    // Check if category has child categories
    const childCategories = await Category.find({ parentCategory: req.params.id });
    
    if (childCategories.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete category with child categories' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    await category.remove();
    
    res.json({ msg: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
