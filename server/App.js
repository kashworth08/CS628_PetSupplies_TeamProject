const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/users');

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Add this after your root route
app.get('/api-test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Define a simple schema and model
const Schema = mongoose.Schema;
const testSchema = new Schema({
  name: { type: String, required: true }
});
const Test = mongoose.model('Test', testSchema);

// Add a new route to create a test document
app.post('/test', async (req, res) => {
  const newTest = new Test({ name: req.body.name });
  try {
    const savedTest = await newTest.save();
    res.status(201).json(savedTest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add a new route to get all test documents
app.get('/test', async (req, res) => {
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
  console.error('MongoDB connection string is missing.');
  process.exit(1);
}

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error details:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
    process.exit(1);
  });

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});