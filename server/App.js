const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const protectedRoute = require("./routes/protectedRoute");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/protected", protectedRoute);

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MongoDB connection string is missing.");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
