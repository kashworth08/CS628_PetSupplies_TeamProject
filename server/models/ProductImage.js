// models/ProductImage.js
const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema({
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  ImagePath: String,
});

module.exports = mongoose.model("ProductImage", productImageSchema);
