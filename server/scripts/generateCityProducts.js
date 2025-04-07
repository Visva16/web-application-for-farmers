const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');
const User = require('../models/User');

// Sample product data
const productTemplates = [
  { category: 'vegetables', names: ['Carrots', 'Broccoli', 'Cucumber', 'Spinach', 'Tomatoes', 'Eggplant', 'Okra'] },
  { category: 'fruits', names: ['Bananas', 'Oranges', 'Grapes', 'Mangoes', 'Watermelon', 'Strawberries', 'Apples'] },
  { category: 'dairy', names: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Paneer', 'Ghee'] },
  { category: 'meat', names: ['Chicken', 'Mutton', 'Fish', 'Eggs'] }
];

async function generateProducts() {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Get all farmers
    const farmers = await User.find({ role: 'farmer' });
    if (farmers.length === 0) {
      console.log('No farmers found in the database');
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${farmers.length} farmers to generate products for`);

    // Create products for each farmer
    let productsCreated = 0;
    for (const farmer of farmers) {
      // Check how many products this farmer already has
      const existingProductCount = await Product.countDocuments({ sellerId: farmer._id });
      console.log(`Farmer ${farmer.email} in ${farmer.city} has ${existingProductCount} existing products`);

      // Only add products if they have less than 3
      if (existingProductCount >= 3) {
        console.log(`Farmer ${farmer.email} already has enough products, skipping`);
        continue;
      }

      // Generate 2-3 products per farmer
      const productsToCreate = 3 - existingProductCount;
      for (let i = 0; i < productsToCreate; i++) {
        // Pick a random category
        const categoryIndex = Math.floor(Math.random() * productTemplates.length);
        const category = productTemplates[categoryIndex];

        // Pick a random product name from the category
        const nameIndex = Math.floor(Math.random() * category.names.length);
        const productName = category.names[nameIndex];

        // Create a new product
        const newProduct = new Product({
          name: productName,
          description: `Fresh ${productName} from ${farmer.city}`,
          price: Math.floor(Math.random() * 50) + 10, // Random price between 10-60
          quantity: Math.floor(Math.random() * 100) + 50, // Random quantity between 50-150
          category: category.category,
          sellerId: farmer._id,
          sellerName: farmer.businessName,
          images: []
        });

        await newProduct.save();
        productsCreated++;
        console.log(`Created ${productName} for farmer ${farmer.email} in ${farmer.city}`);
      }
    }

    console.log(`Product generation complete! Created ${productsCreated} new products`);
    mongoose.disconnect();
  } catch (error) {
    console.error('Error generating products:', error);
    mongoose.disconnect();
  }
}

generateProducts();