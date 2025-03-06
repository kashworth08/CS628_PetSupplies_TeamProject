const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");

// @route   GET /api/admin/get-users
// @desc    Get all users
// @access  Private/Admin
router.get("/get-users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(
      users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   PUT /api/admin/:id
// @desc    Update a user
// @access  Private/Admin
router.put("/:id", auth, admin, async (req, res) => {
  const { username, email, password, role, address } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update fields
    username && (user.username = username);
    password && (user.password = password);
    email && (user.email = email);
    role && (user.role = role);
    address && (user.address = address);

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      address: user.address,
      role: user.role,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/admin/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
