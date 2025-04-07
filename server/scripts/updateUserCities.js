// This script updates existing farmer users with city information
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

// Sample cities to assign to existing farmers
const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad',
  'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat'
];

async function updateFarmerCities() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all farmers without a city
    const farmers = await User.find({ role: 'farmer', city: { $exists: false } });
    console.log(`Found ${farmers.length} farmers without a city assigned`);

    if (farmers.length === 0) {
      console.log('No farmers need updates. Checking if any farmers have cities set...');
      const farmersWithCities = await User.find({ role: 'farmer', city: { $exists: true, $ne: '' } });
      console.log(`${farmersWithCities.length} farmers already have cities assigned.`);

      if (farmersWithCities.length === 0) {
        console.log('No farmers have cities set. Updating all farmers with random cities...');
        const allFarmers = await User.find({ role: 'farmer' });
        for (const farmer of allFarmers) {
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          farmer.city = randomCity;
          await farmer.save();
          console.log(`Updated farmer ${farmer.email} with city ${randomCity}`);
        }
      }

      mongoose.disconnect();
      return;
    }

    // Update each farmer with a random city
    for (const farmer of farmers) {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      farmer.city = randomCity;
      await farmer.save();
      console.log(`Updated farmer ${farmer.email} with city ${randomCity}`);
    }

    console.log('All farmers updated successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating farmer cities:', error);
    mongoose.disconnect();
  }
}

updateFarmerCities();