// models/Order.js
const mongoose = require("mongoose");

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
  TransactionID: String,
});

module.exports = mongoose.model("Order", orderSchema);
