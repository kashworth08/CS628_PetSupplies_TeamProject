// seedUsers.js (for the generic seeding function)
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./models/User");

async function seedUsers(userType, usersToSeed) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {}); // Remove useNewUrlParser and useUnifiedTopology

    const existingUsers = await User.find({ role: userType });
    if (existingUsers.length > 0) {
      console.log(`${userType} users already exist. Skipping seeding.`);
      return;
    }

    const hashedUsers = await Promise.all(
      usersToSeed.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return { ...user, password: hashedPassword, role: userType };
      })
    );

    await User.insertMany(hashedUsers);
    console.log(`${userType} users seeded successfully!`);
  } catch (error) {
    console.error(`Error seeding ${userType} users:`, error);
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = seedUsers; // Export the function
