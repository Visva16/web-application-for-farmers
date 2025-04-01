const express = require('express');
const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');
const { requireUser } = require('./middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Create a new order
router.post('/', requireUser, async (req, res) => {
  try {
    const { user } = req;
    console.log(`User ${user._id} attempting to create a new order`);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Check if user is a vendor
    if (user.role !== 'vendor') {
      console.error(`User ${user._id} with role ${user.role} not authorized to create orders`);
      return res.status(403).json({
        success: false,
        error: 'Only vendors can create orders'
      });
    }

    const orderData = req.body;

    // Add buyer info
    orderData.buyerId = user._id;
    orderData.buyerName = user.businessName;

    // Validate required fields
    const requiredFields = ['sellerId', 'sellerName', 'products', 'shippingAddress'];
    const missingFields = requiredFields.filter(field => !orderData[field]);

    if (missingFields.length > 0) {
      console.error(`Missing required fields for order creation: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate products array
    if (!Array.isArray(orderData.products) || orderData.products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one product is required'
      });
    }

    // Ensure each product has required fields
    for (const product of orderData.products) {
      if (!product.productId || !product.productName || !product.quantity || !product.pricePerUnit) {
        return res.status(400).json({
          success: false,
          error: 'Each product must have productId, productName, quantity, and pricePerUnit'
        });
      }

      // Check if product quantity is available
      try {
        const productDoc = await ProductService.getById(product.productId);
        if (productDoc.quantity < product.quantity) {
          return res.status(400).json({
            success: false,
            error: `Not enough quantity available for product: ${product.productName}`
          });
        }

        // Reduce the product quantity
        await ProductService.update(product.productId, {
          quantity: productDoc.quantity - product.quantity
        });
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: `Error checking product: ${err.message}`
        });
      }
    }

    // Calculate total amount
    orderData.totalAmount = orderData.products.reduce((total, product) => {
      return total + (product.quantity * product.pricePerUnit);
    }, 0);

    console.log('Creating new order with total amount:', orderData.totalAmount);
    const order = await OrderService.create(orderData);

    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get all orders for the authenticated user
router.get('/', requireUser, async (req, res) => {
  try {
    const { user } = req;
    console.log(`User ${user._id} fetching their orders`);

    let orders;
    if (user.role === 'vendor') {
      console.log(`Fetching orders for buyer: ${user._id}`);
      orders = await OrderService.getByBuyer(user._id);
    } else if (user.role === 'farmer') {
      console.log(`Fetching orders for seller: ${user._id}`);
      orders = await OrderService.getBySeller(user._id);
    } else {
      console.error(`Unauthorized role: ${user.role}`);
      return res.status(403).json({
        success: false,
        error: 'Unauthorized role'
      });
    }

    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get order by ID
router.get('/:id', requireUser, async (req, res) => {
  try {
    const { user } = req;
    const orderId = req.params.id;
    console.log(`User ${user._id} attempting to fetch order ${orderId}`);

    const order = await OrderService.getById(orderId);

    // Check if user is authorized to view this order
    if (order.buyerId.toString() !== user._id.toString() &&
        order.sellerId.toString() !== user._id.toString()) {
      console.error(`User ${user._id} not authorized to view order ${orderId}`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error(`Error fetching order ${req.params.id}:`, err);

    if (err.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Update order status
router.patch('/:id/status', requireUser, async (req, res) => {
  try {
    const { user } = req;
    const orderId = req.params.id;
    const { status } = req.body;

    console.log(`User ${user._id} attempting to update order ${orderId} status to ${status}`);

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Get the order
    const order = await OrderService.getById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check authorization
    let authorized = false;

    // Farmers can update any status
    if (user.role === 'farmer' && order.sellerId.toString() === user._id.toString()) {
      authorized = true;
    }

    // Vendors can only update to 'delivered' status
    if (user.role === 'vendor' &&
        order.buyerId.toString() === user._id.toString() &&
        status === 'delivered' &&
        order.status === 'shipped') {
      authorized = true;
    }

    if (!authorized) {
      console.error(`User ${user._id} not authorized to update order ${orderId} status`);
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this order status'
      });
    }

    const updatedOrder = await OrderService.updateStatus(orderId, status);

    res.status(200).json({
      success: true,
      order: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (err) {
    console.error(`Error updating order ${req.params.id} status:`, err);

    if (err.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// TEST ONLY - Seed a sample order for development
if (process.env.NODE_ENV !== 'production') {
  router.post('/seed-test-order', requireUser, async (req, res) => {
    try {
      const { user } = req;

      // Only allow farmers to create test orders
      if (user.role !== 'farmer') {
        return res.status(403).json({
          success: false,
          error: 'Only farmers can create test orders'
        });
      }

      console.log(`Creating test order for farmer ${user._id}`);

      // Find an existing product or create a mock one
      const productService = require('../services/productService');
      let product = await productService.getById('67ca0850bd6caf68194d0a5d');

      if (!product) {
        console.log('Product not found, using default values');
        product = {
          _id: new mongoose.Types.ObjectId('67ca0850bd6caf68194d0a5d'),
          name: 'mango',
          price: 22
        };
      }

      // Create test order data
      const orderData = {
        buyerId: new mongoose.Types.ObjectId('67c9f8bf6e9f066b9bf31754'), // A vendor user ID
        buyerName: 'Test Vendor',
        sellerId: user._id,
        sellerName: user.businessName || 'Test Farmer',
        products: [
          {
            productId: product._id,
            productName: product.name,
            quantity: 10,
            pricePerUnit: product.price
          }
        ],
        totalAmount: 10 * product.price,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: '123 Test Street, City, Country',
        notes: 'This is a test order created through the seed endpoint'
      };

      // Create the order
      const order = await OrderService.create(orderData);

      res.status(201).json({
        success: true,
        order,
        message: 'Test order created successfully'
      });
    } catch (err) {
      console.error('Error creating test order:', err);
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  });
}

module.exports = router;