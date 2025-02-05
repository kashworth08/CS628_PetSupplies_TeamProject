const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MongoDB connection string is missing.');
  process.exit(1);
}

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});