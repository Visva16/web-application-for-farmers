'use strict';

const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');

class PriceAnalysisService {
  /**
   * Get competitive pricing analytics for a specific product type/category
   * @param {string} category - Product category to analyze
   * @param {string} productName - Optional specific product name for more targeted analysis
   * @returns {Object} Pricing statistics and competitive analysis
   */
  static async getCompetitivePricing(category, productName = null) {
    try {
      console.log("Analyzing competitive pricing for category: " + category + (productName ? ", product: " + productName : ""));

      // Build the query based on provided parameters
      const query = { category };
      if (productName) {
        // Use regex for partial matching of product name
        query.name = { $regex: productName, $options: 'i' };
      }

      // Find all matching products
      const products = await Product.find(query);

      if (products.length === 0) {
        console.log('No products found for this analysis criteria');
        return {
          count: 0,
          message: 'No similar products found for analysis',
          averagePrice: 0,
          medianPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          standardDeviation: 0,
          priceRanges: [],
          topProducts: []
        };
      }

      // Extract pricing data
      const prices = products.map(product => product.price);

      // Calculate metrics
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      // Calculate median price
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const middleIndex = Math.floor(sortedPrices.length / 2);
      const medianPrice = sortedPrices.length % 2 === 0
        ? (sortedPrices[middleIndex - 1] + sortedPrices[middleIndex]) / 2
        : sortedPrices[middleIndex];

      // Calculate standard deviation
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - averagePrice, 2), 0) / prices.length;
      const standardDeviation = Math.sqrt(variance);

      // Get price distribution by ranges
      const priceRanges = this.calculatePriceRanges(prices);

      // Calculate demand metrics
      const orderCounts = products.map(p => p.orderCount || 0);
      const avgOrderCount = orderCounts.length > 0
        ? orderCounts.reduce((sum, count) => sum + count, 0) / orderCounts.length
        : 0;

      // Identify high and low demand products
      const highDemandProducts = products.filter(p => (p.orderCount || 0) > avgOrderCount);
      const lowDemandProducts = products.filter(p => (p.orderCount || 0) <= avgOrderCount);

      // Calculate average prices for high and low demand products
      const highDemandAvgPrice = highDemandProducts.length
        ? highDemandProducts.reduce((sum, p) => sum + p.price, 0) / highDemandProducts.length
        : 0;

      const lowDemandAvgPrice = lowDemandProducts.length
        ? lowDemandProducts.reduce((sum, p) => sum + p.price, 0) / lowDemandProducts.length
        : 0;

      // Extract demand data for the analysis
      const demandAnalysis = {
        avgOrderCount: parseFloat(avgOrderCount.toFixed(2)),
        highDemandCount: highDemandProducts.length,
        lowDemandCount: lowDemandProducts.length,
        highDemandAvgPrice: parseFloat(highDemandAvgPrice.toFixed(2)),
        lowDemandAvgPrice: parseFloat(lowDemandAvgPrice.toFixed(2)),
        priceByDemandDifference: parseFloat((highDemandAvgPrice - lowDemandAvgPrice).toFixed(2))
      };

      // Get top 5 similar products for reference, sorted by a score combining price and demand
      const topProducts = products
        .map(product => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          seller: product.sellerName || 'Unknown',
          city: product.city || 'Unknown',
          orderCount: product.orderCount || 0,
          // Simple score that gives weight to both lower price and higher demand
          score: (100 - (product.price / maxPrice) * 100) + ((product.orderCount || 0) / (Math.max(...orderCounts) || 1)) * 100
        }))
        .sort((a, b) => b.score - a.score)  // Sort by score descending
        .slice(0, 5)  // Take top 5
        .map(({ _id, name, price, seller, city }) => ({ _id, name, price, seller, city }));

      console.log("Analysis complete. Found " + products.length + " similar products with avg price: $" + averagePrice.toFixed(2));

      return {
        count: products.length,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        medianPrice: parseFloat(medianPrice.toFixed(2)),
        minPrice: parseFloat(minPrice.toFixed(2)),
        maxPrice: parseFloat(maxPrice.toFixed(2)),
        standardDeviation: parseFloat(standardDeviation.toFixed(2)),
        priceRanges,
        topProducts,
        demandAnalysis,
        message: 'Analysis completed successfully'
      };
    } catch (error) {
      console.error('Error analyzing competitive pricing:', error);
      throw new Error("Failed to analyze competitive pricing: " + error.message);
    }
  }

  /**
   * Calculate price distribution across ranges
   * @param {Array<number>} prices - Array of product prices
   * @returns {Array<Object>} Price distribution by ranges
   */
  static calculatePriceRanges(prices) {
    if (prices.length === 0) return [];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // If all prices are the same, return a single range
    if (minPrice === maxPrice) {
      return [{
        range: "$" + minPrice.toFixed(2),
        count: prices.length,
        percentage: 100
      }];
    }

    // Create 5 price ranges
    const rangeSize = (maxPrice - minPrice) / 5;
    const ranges = [];

    for (let i = 0; i < 5; i++) {
      const lowerBound = minPrice + (i * rangeSize);
      const upperBound = minPrice + ((i + 1) * rangeSize);

      // Count products in this range
      const productsInRange = prices.filter(
        price => price >= lowerBound && (i === 4 ? price <= upperBound : price < upperBound)
      );

      ranges.push({
        range: "$" + lowerBound.toFixed(2) + " - $" + upperBound.toFixed(2),
        count: productsInRange.length,
        percentage: parseFloat(((productsInRange.length / prices.length) * 100).toFixed(1))
      });
    }

    return ranges;
  }

  /**
   * Get pricing insights for a specific product
   * @param {string} productId - ID of the product to analyze
   * @returns {Object} Pricing insights for the specific product
   */
  static async getPricingInsights(productId) {
    try {
      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID format');
      }

      // Find the specific product
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Get competitive pricing for this product's category
      const competitivePricing = await this.getCompetitivePricing(product.category, product.name);

      // Calculate position in the market
      let marketPosition = null;
      if (competitivePricing.count > 1) {
        if (product.price <= competitivePricing.minPrice) {
          marketPosition = 'lowest';
        } else if (product.price >= competitivePricing.maxPrice) {
          marketPosition = 'highest';
        } else if (product.price < competitivePricing.averagePrice) {
          marketPosition = 'below_average';
        } else if (product.price > competitivePricing.averagePrice) {
          marketPosition = 'above_average';
        } else {
          marketPosition = 'average';
        }
      }

      // Calculate price difference from average
      let priceDifferenceFromAverage = null;
      if (competitivePricing.count > 1) {
        priceDifferenceFromAverage = {
          absolute: parseFloat((product.price - competitivePricing.averagePrice).toFixed(2)),
          percentage: parseFloat(((product.price - competitivePricing.averagePrice) / competitivePricing.averagePrice * 100).toFixed(1))
        };
      }

      // Determine demand level based on product's order count compared to the average
      let demandLevel = 'unknown';
      if (competitivePricing.count > 1) {
        const productOrderCount = product.orderCount || 0;
        const avgOrderCount = competitivePricing.demandAnalysis.avgOrderCount;

        if (productOrderCount > avgOrderCount * 1.2) {
          demandLevel = 'high';
        } else if (productOrderCount < avgOrderCount * 0.8) {
          demandLevel = 'low';
        } else {
          demandLevel = 'medium';
        }
      }

      // Generate pricing recommendation based on market position and demand level
      let recommendation = '';
      let suggestedPrice = product.price;

      if (competitivePricing.count > 1) {
        if (demandLevel === 'high' && marketPosition === 'below_average') {
          // High demand but priced below average - opportunity to increase price
          suggestedPrice = parseFloat((competitivePricing.averagePrice * 1.05).toFixed(2));
          recommendation = 'Your product is in high demand but priced below average. Consider raising the price to increase profit margin.';
        } else if (demandLevel === 'low' && marketPosition === 'above_average') {
          // Low demand and priced above average - consider price reduction
          suggestedPrice = parseFloat((competitivePricing.averagePrice * 0.95).toFixed(2));
          recommendation = 'Your product has lower demand and is priced above average. Consider lowering the price to stimulate sales.';
        } else if (demandLevel === 'high' && marketPosition === 'above_average') {
          // High demand and priced above average - likely optimal pricing
          recommendation = 'Your product is in high demand despite being priced above average. Current pricing appears optimal.';
        } else if (demandLevel === 'low' && marketPosition === 'below_average') {
          // Low demand but priced below average - may need marketing
          recommendation = 'Your product has lower demand despite being priced below average. Consider marketing efforts or product improvements rather than price adjustments.';
        } else if (marketPosition === 'highest') {
          // Highest priced product
          if (demandLevel === 'high') {
            recommendation = 'Your product has the highest price in the category but still maintains high demand. Premium pricing strategy is working well.';
          } else {
            suggestedPrice = parseFloat((competitivePricing.averagePrice * 1.05).toFixed(2));
            recommendation = 'Your product has the highest price in the category with moderate to low demand. Consider adjusting price closer to market average.';
          }
        } else if (marketPosition === 'lowest') {
          // Lowest priced product
          if (demandLevel === 'high') {
            suggestedPrice = parseFloat((product.price * 1.05).toFixed(2));
            recommendation = 'Your product has the lowest price in the category with high demand. You may have room to increase price without affecting demand.';
          } else {
            recommendation = 'Your product has the lowest price in the category but isn\'t seeing high demand. Consider product improvements or marketing rather than further price reductions.';
          }
        } else {
          // Default recommendation for average market position
          recommendation = 'Your product has average pricing and demand levels in line with the market.';
        }
      } else {
        recommendation = 'Not enough similar products for competitive analysis. Consider researching market trends for optimal pricing.';
      }

      return {
        productId: product._id,
        productName: product.name,
        currentPrice: product.price,
        category: product.category,
        market: competitivePricing,
        marketPosition,
        priceDifferenceFromAverage,
        demandLevel,
        recommendation,
        suggestedPrice,
        message: 'Pricing insights generated successfully'
      };
    } catch (error) {
      console.error("Error generating pricing insights for product " + productId + ":", error);
      throw new Error("Failed to generate pricing insights: " + error.message);
    }
  }

  /**
   * Update product demand metrics based on historical order data
   * @returns {Promise<Object>} Results of the update operation
   */
  static async updateProductDemandMetrics() {
    try {
      console.log('Starting to update product demand metrics...');

      // Get all orders to analyze
      const orders = await Order.find({});
      console.log(`Found ${orders.length} orders to analyze for demand metrics`);

      // Create maps to track order counts and dates by product
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
      console.log(`Found ${allProducts.length} products to update with demand metrics`);

      // Update all products with demand metrics
      let updatedCount = 0;
      let skippedCount = 0;

      for (const product of allProducts) {
        const productId = product._id.toString();
        const orderCount = productOrderCounts.get(productId) || 0;
        const lastOrderDate = productLastOrderDates.get(productId) || null;

        // Only update if the metrics are different
        if (product.orderCount !== orderCount ||
            (lastOrderDate && (!product.lastOrderDate ||
            product.lastOrderDate.getTime() !== lastOrderDate.getTime()))) {

          await Product.findByIdAndUpdate(productId, {
            orderCount: orderCount,
            lastOrderDate: lastOrderDate
          });
          updatedCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(`Updated demand metrics for ${updatedCount} products, skipped ${skippedCount} products`);
      return {
        success: true,
        updatedCount,
        skippedCount,
        message: 'Product demand metrics updated successfully'
      };
    } catch (error) {
      console.error("Error updating product demand metrics:", error);
      throw new Error(`Failed to update product demand metrics: ${error.message}`);
    }
  }
}

module.exports = PriceAnalysisService;
