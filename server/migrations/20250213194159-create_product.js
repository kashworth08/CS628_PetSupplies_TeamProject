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

      const collections = await db
        .listCollections({ name: "products" })
        .toArray();

      if (collections.length === 0) {
        await db.createCollection("products"); // Use the db object directly
        console.log("Product collection created.");
      } else {
        console.log("Product collection already exists.");
      }

      const Product = mongoose.model("Product", productSchema); // Define your Mongoose model

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
      await db.collection("products").drop(); // Drop the collection using the db object
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
