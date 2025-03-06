// seed/orders.js
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const OrderItem = require("../models/OrderItem");
require("dotenv").config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});

    const users = await User.find({});
    const products = await Product.find({}); // Fetch products

    if (users.length === 0) {
      console.warn("Warning: No users found. Please seed users first.");
      return;
    }

    if (products.length === 0) {
      console.warn("Warning: No products found. Please seed products first.");
      return;
    }

    const ordersToSeed = [
      {
        UserID: users[0]._id,
        TotalAmount: 150.0,
        OrderStatus: "shipped",
        ShippingAddress: "123 Main St, Anytown",
        PaymentMethod: "Credit Card",
        items: [
          // Add items property
          { ProductID: products[0]._id, Quantity: 2 },
          { ProductID: products[1]._id, Quantity: 1 },
        ],
      },
      {
        UserID: users[1]._id,
        TotalAmount: 75.5,
        OrderStatus: "processing",
        ShippingAddress: "456 Oak Ave, Someville",
        PaymentMethod: "PayPal",
        items: [{ ProductID: products[2]._id, Quantity: 3 }],
      },
      {
        UserID: users[2]._id,
        TotalAmount: 200.25,
        OrderStatus: "delivered",
        ShippingAddress: "789 Pine Ln, Othercity",
        PaymentMethod: "Credit Card",
        items: [
          { ProductID: products[3]._id, Quantity: 1 },
          { ProductID: products[0]._id, Quantity: 1 },
        ],
      },
      {
        UserID: users[3]._id,
        TotalAmount: 50.0,
        OrderStatus: "cancelled",
        ShippingAddress: "101 Elm Rd, Nowhere",
        PaymentMethod: "PayPal",
        items: [{ ProductID: products[1]._id, Quantity: 2 }],
      },
      {
        UserID: users[0]._id,
        TotalAmount: 300.75,
        OrderStatus: "processing",
        ShippingAddress: "123 Main St, Anytown",
        PaymentMethod: "Credit Card",
        items: [
          { ProductID: products[2]._id, Quantity: 4 },
          { ProductID: products[3]._id, Quantity: 1 },
        ],
      },
    ];

    for (const orderData of ordersToSeed) {
      const existingOrder = await Order.findOne({
        UserID: orderData.UserID,
        TotalAmount: orderData.TotalAmount,
        ShippingAddress: orderData.ShippingAddress,
      });

      if (!existingOrder) {
        const newOrder = new Order(orderData);
        await newOrder.save();

        // Create OrderItems
        for (const item of orderData.items) {
          const product = await Product.findById(item.ProductID);
          if (product) {
            const orderItem = new OrderItem({
              OrderID: newOrder._id,
              ProductID: item.ProductID,
              Quantity: item.Quantity,
              Price: product.Price, // Price at the time of order
            });
            await orderItem.save();
          } else {
            console.warn(
              `Product with ID ${item.ProductID} not found. Skipping OrderItem creation.`
            );
          }
        }
        console.log(`Order for User ${orderData.UserID} seeded.`);
      } else {
        console.log(
          `Order for User ${orderData.UserID} already exists. Skipping.`
        );
      }
    }

    console.log("Orders seeded successfully (or already existed).");
  } catch (error) {
    console.error("Error seeding orders:", error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { seed };
