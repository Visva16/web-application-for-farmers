const express = require('express');
const router = express.Router();
const Product = require('../models/Product.js');
const User = require('../models/User.js');
const auth = require('./middleware/auth.js');

// Get products by city (for vendors to search farmers' products by location)
router.get('/products-by-city/:city', async (req, res) => {
  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    console.log(`Searching for products from farmers in city: ${city}`);

    // Option 1: Query the product's city field directly (faster)
    const products = await Product.find({
      city: { $regex: new RegExp(city, 'i') }
    });

    if (products.length > 0) {
      console.log(`Found ${products.length} products directly with city: ${city}`);
      return res.json({ products });
    }

    // Option 2: Fallback to the original approach if no products found by city field
    // This helps with backward compatibility for older products that don't have the city field
    console.log(`No products found with city field, searching by farmer location...`);

    // Find farmers in the specified city
    const farmers = await User.find({
      role: 'farmer',
      city: { $regex: new RegExp(city, 'i') }
    });

    if (!farmers.length) {
      console.log(`No farmers found in city: ${city}`);
      return res.json({ products: [] });
    }

    console.log(`Found ${farmers.length} farmers in city: ${city}`);
    farmers.forEach(farmer => {
      console.log(`- Farmer: ${farmer.email}, Business: ${farmer.businessName}, City: ${farmer.city}`);
    });

    // Get the farmer IDs
    const farmerIds = farmers.map(farmer => farmer._id);

    // Find all products from these farmers
    const farmerProducts = await Product.find({
      sellerId: { $in: farmerIds }
    });

    console.log(`Found ${farmerProducts.length} products from farmers in city: ${city}`);
    if (farmerProducts.length > 0) {
      console.log('First few products:');
      farmerProducts.slice(0, 3).forEach(product => {
        console.log(`- ${product.name} (${product.category}) from seller ${product.sellerName}`);
      });
    }

    return res.json({ products: farmerProducts });
  } catch (error) {
    console.error('Error finding products by city:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Get all unique cities where farmers are located
router.get('/cities', async (req, res) => {
  try {
    console.log('Fetching all unique cities where farmers are located');

    // Find all unique cities from users who are farmers
    const farmers = await User.find({ role: 'farmer' });

    // Extract unique cities, filter out null/empty values
    let cities = [...new Set(farmers
      .map(farmer => farmer.city)
      .filter(city => city && city.trim() !== '')
    )].sort();

    console.log(`Found ${cities.length} unique cities`);

    // If no cities found, return a fallback list so the UI isn't empty
    if (cities.length === 0) {
      console.log('No cities found in database, returning fallback list');
      cities = [
        'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
        'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'
      ];
    }

    return res.json({ cities });
  } catch (error) {
    console.error('Error fetching farmer cities:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;