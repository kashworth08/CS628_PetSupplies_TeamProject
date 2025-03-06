// seedProducts.js
const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("../models/Product");
const Category = require("../models/Category");
const ProductImage = require("../models/ProductImage");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    const categories = await Category.find();

    if (categories.length === 0) {
      console.error("No categories found. Please seed categories first.");
      return;
    }

    for (let i = 1; i <= 20; i++) {
      const productName = `Product ${i}`;
      const existingProduct = await Product.findOne({ Name: productName });

      if (!existingProduct) {
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];
        const newProduct = new Product({
          Name: productName,
          Description: `Description for ${productName}`,
          CategoryID: randomCategory._id,
          Price: Math.floor(Math.random() * 100) + 10,
          Stock: Math.floor(Math.random() * 200),
        });

        const createdProduct = await newProduct.save();
        console.log(`${productName} seeded.`);
        // Seed product images
        for (let j = 1; j <= 3; j++) {
          const productImage = new ProductImage({
            ProductID: createdProduct._id,
            ImagePath: `uploads/product-${createdProduct._id}-${j}.jpg`,
          });
          await productImage.save();
        }
      } else {
        console.log(`${productName} already exists. Skipping.`);
      }
    }
    console.log("Products seeded successfully (or already existed).");
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await mongoose.disconnect();
  }
};

module.exports = { seed };
