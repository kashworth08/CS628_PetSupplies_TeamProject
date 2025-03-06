// models/Order.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  OrderDate: { type: Date, default: Date.now },
  TotalAmount: { type: Number, required: true },
  OrderStatus: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled"],
    default: "processing",
  },
  ShippingAddress: String,
  PaymentMethod: String,
  TransactionID: {
    type: String,
    default: uuidv4, // Generates a unique ID using uuidv4
  },
});

module.exports = mongoose.model("Order", orderSchema);
