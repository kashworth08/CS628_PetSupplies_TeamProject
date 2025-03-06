// seed/reviews.js
const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Product = require("../models/Product");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});

    const users = await User.find({});
    const products = await Product.find({});

    if (users.length === 0 || products.length === 0) {
      console.warn(
        "Warning: No users or products found. Please seed users and products first."
      );
      return;
    }

    const reviewsToSeed = [
      {
        UserID: users[0]._id,
        ProductID: products[0]._id,
        Rating: 5,
        Comment: "Excellent product!",
      },
      {
        UserID: users[1]._id,
        ProductID: products[0]._id,
        Rating: 4,
        Comment: "Good product, but could be better.",
      },
      {
        UserID: users[2]._id,
        ProductID: products[1]._id,
        Rating: 3,
        Comment: "Average product.",
      },
      {
        UserID: users[3]._id,
        ProductID: products[2]._id,
        Rating: 5,
        Comment: "Amazing product, very happy with my purchase",
      },
      {
        UserID: users[4]._id,
        ProductID: products[3]._id,
        Rating: 1,
        Comment: "Worst product ever. Do not buy!",
      },
    ];

    for (const reviewData of reviewsToSeed) {
      const existingReview = await Review.findOne({
        UserID: reviewData.UserID,
        ProductID: reviewData.ProductID,
      });

      if (!existingReview) {
        const newReview = new Review(reviewData);
        await newReview.save();
        console.log(
          `Review for Product ${reviewData.ProductID} by User ${reviewData.UserID} seeded.`
        );
      } else {
        console.log(
          `Review for Product ${reviewData.ProductID} by User ${reviewData.UserID} already exists. Skipping.`
        );
      }
    }

    console.log("Reviews seeded successfully (or already existed).");
  } catch (error) {
    console.error("Error seeding reviews:", error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { seed };
