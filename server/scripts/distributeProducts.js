const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const User = require('../models/User');

async function distributeProducts() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    if (farmers.length < 2) {
      console.log('Need at least 2 farmers to distribute products');
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${farmers.length} farmers to distribute products to`);

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to distribute`);

    if (products.length === 0) {
      console.log('No products to distribute');
      mongoose.disconnect();
      return;
    }

    // Create a map of farmer cities for later reference
    const farmerCityMap = {};
    farmers.forEach(farmer => {
      farmerCityMap[farmer._id.toString()] = farmer.city || 'Unknown';
    });

    // Distribute products evenly among farmers
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const farmerIndex = i % farmers.length;
      const farmer = farmers[farmerIndex];

      const oldFarmerId = product.sellerId;
      const oldCity = farmerCityMap[oldFarmerId] || 'Unknown';

      // Skip if the product is already assigned to this farmer
      if (product.sellerId.toString() === farmer._id.toString()) {
        console.log(`Product ${product.name} (${product._id}) is already assigned to farmer ${farmer.email} in ${farmer.city}`);
        continue;
      }

      // Update the product
      product.sellerId = farmer._id;
      product.sellerName = farmer.businessName;
      await product.save();

      console.log(`Moved product ${product.name} (${product._id}) from ${oldCity} to ${farmer.city}`);
    }

    console.log('Product distribution complete!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error distributing products:', error);
    mongoose.disconnect();
  }
}

distributeProducts();