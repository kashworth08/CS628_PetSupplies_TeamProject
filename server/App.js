const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const protectedRoute = require("./routes/protectedRoute");
<<<<<<< HEAD
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payments');
const orderRoutes = require('./routes/orders');
=======
const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/categories");
>>>>>>> origin/main

const app = express();
const port = process.env.PORT || 5000;

// Check for JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn(
    "Warning: JWT_SECRET is not set. Using default secret. This is not secure for production."
  );
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cs628-petsupplies-teamproject.onrender.com",
      "*",
    ], // Added '*' for File 2 and existing origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Keep credentials: true from file 1
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added urlencoded from file 1

// Simple test route
app.get("/", (req, res) => {
  console.log("Root route hit");
  res.send("Hello World!");
});

// Test route to check if server is responding
app.get("/api-test", (req, res) => {
  console.log("API test route hit");
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// Routes
<<<<<<< HEAD
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoute);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
=======
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
>>>>>>> origin/main

// Define a simple schema and model
const Schema = mongoose.Schema;
const testSchema = new Schema({
  name: { type: String, required: true },
});
const Test = mongoose.model("Test", testSchema);

// Add a new route to create a test document
app.post("/test", async (req, res) => {
  console.log("Test document creation route hit with data:", req.body);
  const newTest = new Test({ name: req.body.name });
  try {
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a new route to get all test documents
app.get("/test", async (req, res) => {
  console.log("Get all test documents route hit");
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB connection string is missing.");
  process.exit(1);
}

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    process.exit(1);
  });

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  console.log(`Test the API at: http://localhost:${port}/api-test`);
});
