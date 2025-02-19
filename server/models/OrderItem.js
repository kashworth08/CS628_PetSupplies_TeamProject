// models/OrderItem.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  OrderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  Quantity: { type: Number, required: true },
  Price: { type: Number, required: true }, // Price at the time of order
});

module.exports = mongoose.model("OrderItem", orderItemSchema);
