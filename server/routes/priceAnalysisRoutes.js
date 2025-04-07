const express = require('express');
const PriceAnalysisService = require('../services/priceAnalysisService');
const auth = require('../middleware/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

console.log('Loading priceAnalysisRoutes.js');

// Get competitive pricing by category
router.get('/category/:category', auth, async (req, res) => {
  try {
    const { category } = req.params;
    const { productName } = req.query;
    console.log(`Received request for price analysis of category: ${category}${productName ? `, product: ${productName}` : ''}`);

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Category parameter is required'
      });
    }

    const analysis = await PriceAnalysisService.getCompetitivePricing(category, productName);

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error in price analysis route:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get product insights
router.get('/product/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Received request for product insights for: ${id}`);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Product ID parameter is required'
      });
    }

    const insights = await PriceAnalysisService.getPricingInsights(id);

    return res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('Error in product insights route:', error);

    if (error.message === 'Product not found' || error.message === 'Invalid product ID format') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin endpoint to update demand metrics
router.post('/update-demand-metrics', authMiddleware, async (req, res) => {
  try {
    // Only allow admins or system users to run this operation
    if (req.user.role !== 'admin' && req.user.role !== 'system') {
      console.log(`Unauthorized attempt to update demand metrics by user with role: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }

    console.log('Admin user triggered demand metrics update');
    const result = await PriceAnalysisService.updateProductDemandMetrics();
    console.log('Demand metrics update completed with result:', result);
    return res.json(result);
  } catch (error) {
    console.error('Error in /update-demand-metrics endpoint:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;