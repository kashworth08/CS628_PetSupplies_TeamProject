// migrations/20231027120000-create-users.js (Corrected for migrate-mongo)
require("dotenv").config();

const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

module.exports = {
  async up(db) {
    // Receive the MongoDB db object
    try {
      await mongoose.connect(uri, {}); // Connect using Mongoose inside the up function
      console.log("Successfully connected to MongoDB with Mongoose (up).");
    } catch (error) {
      console.error("Mongoose connection error (up):", error);
      throw error; // Re-throw the error to halt the migration
    }

    try {
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

      const collections = await db
        .listCollections({ name: "orderitems" })
        .toArray();

      if (collections.length === 0) {
        await db.createCollection("orderitems"); // Use the db object directly
        console.log("Order Item collection created.");
      } else {
        console.log("Order Item collection already exists.");
      }

      const OrderItem = mongoose.model("OrderItem", orderItemSchema); // Define your Mongoose model

      await mongoose.disconnect(); // Disconnect Mongoose after the migration
      console.log("Mongoose connection closed (up).");
    } catch (error) {
      console.error("Error during up migration:", error);
      await mongoose.disconnect(); // Ensure disconnection even on error
      throw error;
    }
  },

  async down(db) {
    // Receive the MongoDB db object
    try {
      await mongoose.connect(uri, {});
      console.log("Successfully connected to MongoDB with Mongoose (down).");
    } catch (error) {
      console.error("Mongoose connection error (down):", error);
      throw error; // Re-throw the error to halt the migration
    }
    try {
      await db.collection("").drop(); // Drop the collection using the db object
      console.log("User collection dropped.");

      await mongoose.disconnect();
      console.log("Mongoose connection closed (down).");
    } catch (error) {
      console.error("Error during down migration:", error);
      await mongoose.disconnect();
      throw error;
    }
  },
};
