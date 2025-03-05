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
