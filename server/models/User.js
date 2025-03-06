// models/User.js

const mongoose = require("mongoose");
// const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
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

// Pre-save hook to hash passwords
UserSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
