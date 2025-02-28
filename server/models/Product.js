// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Description: String,
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
