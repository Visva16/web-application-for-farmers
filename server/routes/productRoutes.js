const express = require('express');
const ProductService = require('../services/productService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sellerId } = req.query;

    console.log('Fetching products with filters:', { category, search, sellerId });

    // Build filter object
    const filters = {};

    if (category && category !== 'all') {
      filters.category = category;
    }

    if (search) {
      filters.name = { $regex: search, $options: 'i' };
    }

    if (sellerId) {
      filters.sellerId = sellerId;
    }

    const products = await ProductService.getAll(filters);

    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    const product = await ProductService.getById(req.params.id);
    console.log(`Successfully retrieved product: ${product.name}`);
    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error(`Error fetching product with ID ${req.params.id}:`, err);

    if (err.message === 'Product not found' || err.message === 'Invalid product ID format') {
      return res.status(404).json({ success: false, error: err.message });
    }

    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new product (requires authentication)
router.post('/', requireUser, async (req, res) => {
  try {
    const { user } = req;
    console.log(`User ${user._id} attempting to create a new product`);

    // Check if user is allowed to create products
    if (!user || !['vendor', 'farmer'].includes(user.role)) {
      console.error(`User ${user._id} with role ${user.role} not authorized to create products`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to create products'
      });
    }

    const productData = {
      ...req.body,
      sellerId: user._id,
      sellerName: user.businessName,
      sellerType: user.role
    };

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'quantity', 'category'];
    const missingFields = requiredFields.filter(field => !productData[field]);

    if (missingFields.length > 0) {
      console.error(`Missing required fields for product creation: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    console.log('Creating new product:', productData.name);
    const product = await ProductService.create(productData);
    console.log(`Product created successfully with ID: ${product._id}`);

    res.status(201).json({
      success: true,
      product,
      message: 'Product created successfully'
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update product (requires authentication)
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { user } = req;
    const productId = req.params.id;
    console.log(`User ${user._id} attempting to update product ${productId}`);

    // Fetch the product to check ownership
    const existingProduct = await ProductService.getById(productId);

    // Check if user is the owner
    if (existingProduct.sellerId.toString() !== user._id.toString()) {
      console.error(`User ${user._id} not authorized to update product ${productId} owned by ${existingProduct.sellerId}`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this product'
      });
    }

    console.log(`Updating product ${productId}:`, req.body);
    const updatedProduct = await ProductService.update(productId, req.body);
    console.log(`Product ${productId} updated successfully`);

    res.status(200).json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (err) {
    console.error(`Error updating product ${req.params.id}:`, err);

    if (err.message === 'Product not found' || err.message === 'Invalid product ID format') {
      return res.status(404).json({ success: false, error: err.message });
    }

    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete product (requires authentication)
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { user } = req;
    const productId = req.params.id;
    console.log(`User ${user._id} attempting to delete product ${productId}`);

    // Fetch the product to check ownership
    const existingProduct = await ProductService.getById(productId);

    // Check if user is the owner
    if (existingProduct.sellerId.toString() !== user._id.toString()) {
      console.error(`User ${user._id} not authorized to delete product ${productId} owned by ${existingProduct.sellerId}`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this product'
      });
    }

    console.log(`Deleting product ${productId}`);
    await ProductService.delete(productId);
    console.log(`Product ${productId} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error(`Error deleting product ${req.params.id}:`, err);

    if (err.message === 'Product not found' || err.message === 'Invalid product ID format') {
      return res.status(404).json({ success: false, error: err.message });
    }

    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;