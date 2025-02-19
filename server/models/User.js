// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Email: { type: String, unique: true, required: true },
  Password: { type: String, required: true },
  FirstName: String,
  LastName: String,
  Address: String,
  Role: { type: String, enum: ["customer", "admin"], default: "customer" },
  CreatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
