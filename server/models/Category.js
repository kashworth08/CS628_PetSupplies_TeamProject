// models/Category.js
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  Name: { type: String, required: true },
  ParentCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: "Category" }, // Self-reference for subcategories
});

module.exports = mongoose.model("Category", categorySchema);
