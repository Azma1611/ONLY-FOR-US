const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is missing from .env');
  process.exit(1);
}

console.log('Testing Atlas Connection...');

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✓ Connected');
    process.exit(0);
  })
  .catch(err => {
    console.log('Exact error:', err.message);
    if (err.message.includes('alert number 80') || err.message.includes('ECONNREFUSED')) {
      console.log('\nCAUSE: Network Access whitelist (IP not allowed)');
      console.log('Please whitelist your IP address in the MongoDB Atlas dashboard.');
    }
    process.exit(1);
  });
