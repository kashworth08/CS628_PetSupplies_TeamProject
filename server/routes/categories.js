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
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private/Admin
router.post('/', auth, admin, async (req, res) => {
  const { Name, ParentCategoryID } = req.body;
  
  try {
    // Check if parent category exists if provided
    if (ParentCategoryID) {
      const parentCategory = await Category.findById(ParentCategoryID);
      if (!parentCategory) {
        return res.status(400).json({ msg: 'Parent category not found' });
      }
    }
    
    const newCategory = new Category({
      Name,
      ParentCategoryID
    });
    
    const category = await newCategory.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ msg: 'Server error' });
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { auth, admin } = require("../middleware/auth");

// @route   POST /api/create-category
// @desc    Create a new category
// @access  Private/Admin
router.post("/create-category", auth, admin, async (req, res) => {
  try {
    const category = new Category(req.body);
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   GET /api/get-all
// @desc    Get all categories
// @access  Public
router.get("/get-all", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//@route GET /api/categories/:id
//@desc Get a single category
//@access Private/Admin
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parentCategoryId"
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', auth, admin, async (req, res) => {
  const { Name, ParentCategoryID } = req.body;
  
  try {
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if parent category exists if provided
    if (ParentCategoryID && ParentCategoryID !== category.ParentCategoryID?.toString()) {
      // Prevent circular reference (category can't be its own parent)
      if (ParentCategoryID === req.params.id) {
        return res.status(400).json({ msg: 'Category cannot be its own parent' });
      }
      
      const parentCategory = await Category.findById(ParentCategoryID);
      if (!parentCategory) {
        return res.status(400).json({ msg: 'Parent category not found' });
      }
    }
    
    // Update fields
    if (Name) category.Name = Name;
    if (ParentCategoryID !== undefined) category.ParentCategoryID = ParentCategoryID;
    
    await category.save();
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
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
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ msg: 'Category not found' });
    }
    
    // Check if category has child categories
    const childCategories = await Category.find({ ParentCategoryID: req.params.id });
    if (childCategories.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete category with child categories' });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Category removed' });
  } catch (error) {
    console.error('Delete category error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Category not found' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router; 
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

//@route DELETE /api/categories/:id
//@desc Delete a category
//@access Private/Admin
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
