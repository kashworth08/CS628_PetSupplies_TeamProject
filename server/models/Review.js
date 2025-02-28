// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  Rating: Number,
  Comment: String,
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Review", reviewSchema);
