// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// User registration
router.post("/register-user", async (req, res) => {
  try {
    const { username, email, password, address } = req.body;

    // 1. Required Field Validation
    if (!username || !email || !password || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 2. Check for Existing User (using MongoDB)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    // 3. Create New User
    const user = new User({
      username,
      password,
      email,
      address,
    });

    // 4. Save to Database
    await user.save();

    // 5. Respond with Success
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error); // Log the error for debugging
    res.status(500).json({ error: "Registration failed" });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
