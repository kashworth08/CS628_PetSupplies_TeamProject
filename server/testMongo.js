const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Attempting to connect with URI:', uri);

mongoose.connect(uri)
  .then(() => {
    console.log('Test connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test connection failed:', err.message);
    process.exit(1);
  }); 