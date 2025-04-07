const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const User = require('../models/User');

async function updateProductCities() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all products without a city field
    const products = await Product.find({
      $or: [
        { city: { $exists: false } },
        { city: null },
        { city: "" }
      ]
    });

    console.log(`Found ${products.length} products without city information`);

    // Create a cache of user cities to reduce database queries
    const userCities = {};

    // Update each product with its seller's city
    let updatedCount = 0;
    for (const product of products) {
      // Skip products without a sellerId
      if (!product.sellerId) {
        console.log(`Skipping product ${product._id} (${product.name}) - no sellerId`);
        continue;
      }

      const sellerId = product.sellerId.toString();

      // Get city from cache or database
      if (!userCities[sellerId]) {
        const seller = await User.findById(sellerId);
        if (seller && seller.city) {
          userCities[sellerId] = seller.city;
        } else {
          console.log(`Seller ${sellerId} not found or doesn't have a city`);
          continue;
        }
      }

      // Update the product with the city
      product.city = userCities[sellerId];
      await product.save();
      updatedCount++;

      console.log(`Updated product ${product.name} with city ${product.city} from seller ${product.sellerName}`);
    }

    console.log(`Updated ${updatedCount} of ${products.length} products with city information`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error updating product cities:', error);
    mongoose.disconnect();
  }
}

updateProductCities();