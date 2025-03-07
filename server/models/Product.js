// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Description: String,
  ImageURL: { type: String, default: "https://via.placeholder.com/150" },
  CategoryID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Reference to Category
  Price: { type: Number, required: true },
  Stock: { type: Number, required: true },
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
