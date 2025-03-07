// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: String,
    ref: "User",
    required: false // Not required for guest orders
  },
  sessionId: {
    type: String,
    required: false // Required for guest orders
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  shippingAddress: {
    fullName: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: "US"
    }
  },
  paymentInfo: {
    paymentId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "Processing",
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure either user or sessionId is provided
orderSchema.pre('save', function(next) {
  if (!this.user && !this.sessionId) {
    return next(new Error('Either user or sessionId must be provided'));
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
