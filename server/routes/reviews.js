const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const { auth } = require("../middleware/auth");

// Create Review Endpoint
// Only authenticated users can create reviews
// @route POST /api/reviews/add-review
// @desc Add a review
// @access Private
// @role User
router.post("/add-review", auth, async (req, res) => {
  try {
    const review = new Review(req.body);
    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get Review by ID Endpoint
// @route GET /api/reviews/:id
// @desc Get a review by ID
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate(
      "UserID ProductID"
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Reviews by ProductID Endpoint
// @route GET /api/reviews/product/:productId
// @desc Get reviews by ProductID
// @access Private
// @role User
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      ProductID: req.params.productId,
    }).populate("UserID ProductID");
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "Reviews not found for this product" });
    }
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Reviews by UserID Endpoint
// @route GET /api/reviews/user/:userId
// @desc Get reviews by UserID
// @access Private
// @role User
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ UserID: req.params.userId }).populate(
      "UserID ProductID"
    );
    if (!reviews || reviews.length === 0) {
      return res
        .status(404)
        .json({ message: "Reviews not found for this user" });
    }
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Review Endpoint
// Only authenticated users can update reviews
// @route PUT /api/reviews/:id
// @desc Update a review
// @access Private
// @role User
router.put("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the authenticated user is the owner of the review
    if (review.UserID.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this review" });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    ).populate("UserID ProductID");

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Review Endpoint
// Only authenticated users can delete reviews
// @route DELETE /api/reviews/:id
// @desc Delete a review
// @access Private
// @role User
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the authenticated user is the owner of the review
    if (review.UserID.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this review" });
    }

    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
