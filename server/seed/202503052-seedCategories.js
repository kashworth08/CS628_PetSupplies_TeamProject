// seedCategories.js
const mongoose = require("mongoose");
require("dotenv").config();
const Category = require("../models/Category");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});

    const categoriesToSeed = [
      { Name: "Electronics" },
      { Name: "Clothing" },
      { Name: "Books" },
      { Name: "Home & Kitchen" },
      { Name: "Toys" },
      { Name: "Sports & Outdoors" },
      { Name: "Beauty & Personal Care" },
      { Name: "Groceries" },
      { Name: "Automotive" },
      { Name: "Pet Supplies" },
    ];

    for (const categoryData of categoriesToSeed) {
      const existingCategory = await Category.findOne({
        Name: categoryData.Name,
      });

      if (!existingCategory) {
        const newCategory = new Category(categoryData);
        await newCategory.save();
        console.log(`Category ${categoryData.Name} seeded.`);
      } else {
        console.log(`Category ${categoryData.Name} already exists. Skipping.`);
      }
    }

    console.log("Categories seeded successfully (or already existed).");
  } catch (error) {
    console.error("Error seeding categories:", error);
  } finally {
    await mongoose.disconnect();
  }
};

module.exports = { seed };
