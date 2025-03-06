// seedUsers.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("../models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});

    const usersToSeed = [
      {
        username: "admin1",
        email: "admin1@example.com",
        password: "password1",
        address: "123 Admin St",
        role: "admin",
      },
      {
        username: "admin2",
        email: "admin2@example.com",
        password: "password2",
        address: "456 Admin Ave",
        role: "admin",
      },
      {
        username: "admin3",
        email: "admin3@example.com",
        password: "password3",
        address: "789 Admin Rd",
        role: "admin",
      },
      {
        username: "admin4",
        email: "admin4@example.com",
        password: "password4",
        address: "101 Admin Ln",
        role: "admin",
      },
      {
        username: "user1",
        email: "user1@example.com",
        password: "password1",
        address: "123 Admin St",
        role: "user",
      },
      {
        username: "user2",
        email: "user2@example.com",
        password: "password2",
        address: "456 Admin Ave",
        role: "user",
      },
      {
        username: "user3",
        email: "user3@example.com",
        password: "password3",
        address: "789 Admin Rd",
        role: "user",
      },
      {
        username: "user4",
        email: "user4@example.com",
        password: "password4",
        address: "101 Admin Ln",
        role: "user",
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ email: userData.email });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({ ...userData, password: hashedPassword });
        await newUser.save();
        console.log(`User ${userData.email} seeded.`);
      } else {
        console.log(`User ${userData.email} already exists. Skipping.`);
      }
    }

    console.log("All users seeded successfully (or already existed).");
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { seed };
