// models/CartItem.js
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  Quantity: { type: Number, required: true },
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CartItem", cartItemSchema);
