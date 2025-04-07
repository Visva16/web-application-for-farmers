const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('../config/database')();

/**
 * Updates product demand metrics based on historical order data
 */
async function updateProductDemandMetrics() {
  try {
    console.log('Starting product demand metrics update...');

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders to analyze`);

    // Create a map to track order counts by product
    const productOrderCounts = new Map();
    const productLastOrderDates = new Map();

    // Process each order
    for (const order of orders) {
      for (const item of order.products) {
        const productId = item.productId.toString();

        // Update order count
        if (!productOrderCounts.has(productId)) {
          productOrderCounts.set(productId, 0);
        }
        productOrderCounts.set(productId, productOrderCounts.get(productId) + 1);

        // Track last order date
        const orderDate = new Date(order.createdAt);
        if (!productLastOrderDates.has(productId) ||
            orderDate > productLastOrderDates.get(productId)) {
          productLastOrderDates.set(productId, orderDate);
        }
      }
    }

    // Get all products to also update those with zero orders
    const allProducts = await Product.find({});
    console.log(`Found ${allProducts.length} products in database`);

    // Update all products with demand metrics
    let updatedCount = 0;
    for (const product of allProducts) {
      const productId = product._id.toString();
      const orderCount = productOrderCounts.get(productId) || 0;
      const lastOrderDate = productLastOrderDates.get(productId) || null;

      await Product.findByIdAndUpdate(productId, {
        orderCount: orderCount,
        lastOrderDate: lastOrderDate
      });
      updatedCount++;
    }

    console.log(`Updated demand metrics for ${updatedCount} products`);
    console.log('Demand metrics update completed successfully');
    return { success: true, updatedCount };
  } catch (error) {
    console.error('Error updating product demand metrics:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

// Run the function if executed directly
if (require.main === module) {
  updateProductDemandMetrics()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
} else {
  // Export for use in other files
  module.exports = updateProductDemandMetrics;
}