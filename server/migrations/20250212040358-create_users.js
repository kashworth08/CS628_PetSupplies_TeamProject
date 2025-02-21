// migrations/20231027120000-create-users.js (Corrected for migrate-mongo)
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
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
      const userSchema = new mongoose.Schema(
        {
          _id: {
            type: String,
            default: uuidv4, // Generates a unique ID using uuidv4
          },
          username: {
            type: String,
            required: true,
            unique: true,
            minlength: 3,
            maxlength: 30,
          },
          email: {
            type: String,
            required: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/, // Basic email validation
          },
          password: {
            type: String,
            required: true,
            minlength: 6,
          },
          address: {
            type: String,
            required: true,
            maxlength: 100,
          },
          role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
          },
        },
        { timestamps: true }
      );

      const collections = await db.listCollections({ name: "users" }).toArray();

      if (collections.length === 0) {
        await db.createCollection("users"); // Use the db object directly
        console.log("User collection created.");
      } else {
        console.log("User collection already exists.");
      }

      const User = mongoose.model("User", userSchema); // Define your Mongoose model

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
      await db.collection("users").drop(); // Drop the collection using the db object
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
