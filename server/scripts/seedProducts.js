require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority'
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Create categories if they don't exist
const createCategories = async () => {
  const categories = [
    { Name: 'Food', Description: 'Pet food and treats' },
    { Name: 'Toy', Description: 'Pet toys and entertainment' },
    { Name: 'Leashes & Collars', Description: 'Leashes, collars, and harnesses' },
    { Name: 'Furniture', Description: 'Pet beds, houses, and furniture' }
  ];

  const categoryMap = {};

  for (const category of categories) {
    const existingCategory = await Category.findOne({ Name: category.Name });
    if (existingCategory) {
      console.log(`Category "${category.Name}" already exists`);
      categoryMap[category.Name] = existingCategory._id;
    } else {
      const newCategory = new Category(category);
      await newCategory.save();
      console.log(`Category "${category.Name}" created`);
      categoryMap[category.Name] = newCategory._id;
    }
  }

  return categoryMap;
};

// Seed products
const seedProducts = async () => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log(`${existingProducts} products already exist in the database`);
      const overwrite = process.argv.includes('--overwrite');
      if (!overwrite) {
        console.log('Use --overwrite flag to replace existing products');
        return;
      }
      console.log('Overwriting existing products...');
      await Product.deleteMany({});
    }

    // Create categories first
    const categoryMap = await createCategories();

    // Product data
    const products = [
      { 
        Name: "Chew Toy", 
        ImageURL: "https://images.unsplash.com/photo-1522008693277-086ad6075b78?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9nJTIwY2hldyUyMHRveXxlbnwwfHwwfHx8MA%3D%3D", 
        Description: "Durable chew toy.", 
        Price: 9.99, 
        Stock: 50, 
        CategoryID: categoryMap['Toy']
      },
      { 
        Name: "Scratching Post", 
        ImageURL: "https://images.unsplash.com/photo-1636543459635-c9756f9aef79?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c2NyYXRjaGluZyUyMHBvc3R8ZW58MHx8MHx8fDA%3D", 
        Description: "Sturdy scratching post.", 
        Price: 24.99, 
        Stock: 30, 
        CategoryID: categoryMap['Toy']
      },
      { 
        Name: "Bite-proof Leash", 
        ImageURL: "https://images.unsplash.com/photo-1625734062403-428e52d753fe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxlYXNofGVufDB8fDB8fHww", 
        Description: "Durable dog leash.", 
        Price: 15.49, 
        Stock: 45, 
        CategoryID: categoryMap['Leashes & Collars']
      },
      { 
        Name: "Cat Food", 
        ImageURL: "https://plus.unsplash.com/premium_photo-1726761692986-6bcde87fc2b8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2F0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", 
        Description: "Nutritious cat food.", 
        Price: 19.99, 
        Stock: 100, 
        CategoryID: categoryMap['Food']
      },
      { 
        Name: "Dog Food", 
        ImageURL: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8ZG9nJTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", 
        Description: "Healthy dog food.", 
        Price: 22.99, 
        Stock: 80, 
        CategoryID: categoryMap['Food']
      },
      { 
        Name: "Pet Collar", 
        ImageURL: "https://images.unsplash.com/photo-1605639496822-eddf63ad6c8f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZG9nJTIwY29sbGFyfGVufDB8fDB8fHww", 
        Description: "Stylish pet collar.", 
        Price: 10.99, 
        Stock: 60, 
        CategoryID: categoryMap['Leashes & Collars']
      },
      { 
        Name: "Cat Bed", 
        ImageURL: "https://images.unsplash.com/photo-1573682127988-f67136e7f12a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Y2F0JTIwYmVkfGVufDB8fDB8fHww", 
        Description: "Soft and cozy bed.", 
        Price: 29.99, 
        Stock: 25, 
        CategoryID: categoryMap['Furniture']
      },
      { 
        Name: "Kong", 
        ImageURL: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nJTIwdG95fGVufDB8fDB8fHww", 
        Description: "Red Kong", 
        Price: 10.99, 
        Stock: 40, 
        CategoryID: categoryMap['Toy']
      },
      { 
        Name: "Freeze-dried Chicken Treats", 
        ImageURL: "https://images.unsplash.com/photo-1571873735645-1ae72b963024?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D", 
        Description: "Healthy snack for dogs", 
        Price: 9.99, 
        Stock: 70, 
        CategoryID: categoryMap['Food']
      },
    ];

    // Insert products
    await Product.insertMany(products);
    console.log(`${products.length} products seeded successfully`);
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the script
connectDB().then(() => {
  seedProducts();
}); 