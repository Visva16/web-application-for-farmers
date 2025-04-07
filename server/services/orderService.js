const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const UserService = require('../services/userService');
const ProductService = require('../services/productService');

class OrderService {
  constructor() {
    this.userService = UserService;
    this.productService = ProductService;
  }

  /**
   * Get all orders based on query parameters
   * @param {Object} query Query parameters for filtering
   * @returns {Promise<Array>} Array of orders
   */
  async getAll(query = {}) {
    try {
      console.log('Fetching orders with query:', query);
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error(`Database error while fetching orders: ${error.message}`);
    }
  }

  /**
   * Get orders where the user is the buyer
   * @param {string} userId ID of the buyer
   * @returns {Promise<Array>} Array of orders
   */
  async getByBuyer(userId) {
    try {
      console.log(`Fetching orders for buyer: ${userId}`);
      return this.getAll({ buyerId: userId });
    } catch (error) {
      console.error(`Error fetching orders for buyer ${userId}:`, error);
      throw new Error(`Database error while fetching buyer orders: ${error.message}`);
    }
  }

  /**
   * Get orders where the user is the seller
   * @param {string} userId ID of the seller
   * @returns {Promise<Array>} Array of orders
   */
  async getBySeller(userId) {
    try {
      console.log(`Fetching orders for seller: ${userId}`);
      return this.getAll({ sellerId: userId });
    } catch (error) {
      console.error(`Error fetching orders for seller ${userId}:`, error);
      throw new Error(`Database error while fetching seller orders: ${error.message}`);
    }
  }

  /**
   * Get an order by its ID
   * @param {string} id Order ID
   * @returns {Promise<Object>} Order object
   */
  async getById(id) {
    try {
      console.log(`Fetching order with ID: ${id}`);
      const order = await Order.findById(id);
      if (!order) {
        throw new Error('Order not found');
      }
      return order;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      if (error.message === 'Order not found') {
        throw error;
      }
      throw new Error(`Database error while fetching order: ${error.message}`);
    }
  }

  /**
   * Create a new order with validation for vendor role
   * @param {Object} orderData Order data
   * @returns {Promise<Object>} Created order
   */
  async createOrder(orderData) {
    try {
      console.log('Creating order with data:', orderData);

      // Get user info to validate role
      const user = await this.userService.get(orderData.buyerId);
      if (!user) {
        throw new Error('User not found');
      }

      console.log(`Order being created by user ${user.email} with role ${user.role}`);

      // Validate that user is a vendor - vendors should be able to create orders
      if (user.role !== 'vendor') {
        console.log(`User ${user.email} with role ${user.role} attempted to create an order - not allowed`);
        throw new Error('Only vendors can create orders');
      }

      // Validate required fields
      if (!orderData.sellerId) throw new Error('Seller ID is required');
      if (!orderData.products || !Array.isArray(orderData.products) || orderData.products.length === 0) {
        throw new Error('At least one product is required');
      }

      // Verify the seller exists
      const seller = await this.userService.get(orderData.sellerId);
      if (!seller) {
        throw new Error('Seller not found');
      }

      // Validate seller role
      if (seller.role !== 'farmer') {
        throw new Error('Orders can only be placed with farmers');
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const product of orderData.products) {
        const productInfo = await this.productService.getById(product.productId);

        // Validate product belongs to the seller
        if (productInfo.sellerId.toString() !== orderData.sellerId.toString()) {
          throw new Error(`Product ${productInfo.name} does not belong to the specified seller`);
        }

        // Check if enough quantity is available
        if (productInfo.quantity < product.quantity) {
          throw new Error(`Not enough quantity available for ${productInfo.name}`);
        }

        // Add to total
        totalAmount += product.quantity * product.pricePerUnit;

        // Decrease product quantity
        const newQuantity = productInfo.quantity - product.quantity;
        await this.productService.update(productInfo._id, {
          quantity: newQuantity,
          lastOrderDate: new Date()
        });

        console.log(`Updated quantity for product ${productInfo._id} from ${productInfo.quantity} to ${newQuantity}`);
      }

      // Create the order
      const order = new Order({
        buyerId: orderData.buyerId,
        buyerName: user.businessName || user.email,
        sellerId: orderData.sellerId,
        sellerName: seller.businessName || seller.email,
        products: orderData.products,
        totalAmount: totalAmount,
        status: 'pending',
        shippingAddress: orderData.shippingAddress,
        // Additional demand tracking
        orderSource: 'vendor_portal'
      });

      const savedOrder = await order.save();
      console.log(`Order ${savedOrder._id} created successfully with total amount: ${totalAmount}`);

      // Update product demand metrics
      await this.updateProductDemandMetrics(orderData.products);

      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update product demand metrics when an order is placed
   * @param {Array} orderProducts Products in the order
   * @returns {Promise<void>}
   */
  async updateProductDemandMetrics(orderProducts) {
    try {
      const now = new Date();

      // Process each product in the order
      const updatePromises = orderProducts.map(item => {
        return Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { orderCount: 1 },
            lastOrderDate: now
          },
          { new: true }
        );
      });

      await Promise.all(updatePromises);
      console.log(`Updated demand metrics for ${updatePromises.length} products`);
    } catch (error) {
      console.error('Error updating product demand metrics:', error);
      // Don't throw here to avoid disrupting order creation
    }
  }

  /**
   * Create a new order
   * @param {Object} orderData Order data
   * @returns {Promise<Object>} Created order
   */
  async create(orderData) {
    try {
      console.log('Creating a new order:', orderData);

      // Validate required fields
      if (!orderData.buyerId || !orderData.sellerId || !orderData.products || orderData.products.length === 0) {
        throw new Error('Missing required order information');
      }

      // Calculate total amount and update product quantities
      let totalAmount = 0;
      for (const item of orderData.products) {
        // Find product and check availability
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity available for ${product.name}`);
        }

        // Update product quantity - we do this outside of a transaction now
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } }
        );

        // Add to total amount
        totalAmount += item.quantity * product.price;
      }

      // Create order with calculated total
      const orderToCreate = {
        ...orderData,
        totalAmount,
        status: orderData.status || 'pending',
        paymentStatus: orderData.paymentStatus || 'pending'
      };

      const order = new Order(orderToCreate);
      const savedOrder = await order.save();

      console.log('Order created successfully:', savedOrder._id);

      // Update product demand metrics
      await this.updateProductDemandMetrics(orderData.products);

      // After successfully creating the order, update product demand metrics
      for (const item of orderData.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          {
            $inc: { orderCount: 1 },
            lastOrderDate: new Date()
          }
        );
        console.log(`Updated demand metrics for product ${item.productId}`);
      }

      return savedOrder;
    } catch (error) {
      console.error('Error creating order:', error);

      // If there was an error, we should try to restore the product quantities
      // This is a best-effort recovery since we don't have transactions
      try {
        if (orderData && orderData.products) {
          for (const item of orderData.products) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { quantity: item.quantity } }
            );
          }
          console.log('Restored product quantities after error');
        }
      } catch (restoreError) {
        console.error('Failed to restore product quantities:', restoreError);
      }

      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  /**
   * Update order status
   * @param {string} id Order ID
   * @param {string} status New status value
   * @returns {Promise<Object>} Updated order
   */
  async updateStatus(id, status) {
    try {
      console.log(`Updating order ${id} status to: ${status}`);
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw new Error(`Database error while updating order status: ${error.message}`);
    }
  }

  /**
   * Update order payment status
   * @param {string} id Order ID
   * @param {string} paymentStatus New payment status
   * @returns {Promise<Object>} Updated order
   */
  async updatePaymentStatus(id, paymentStatus) {
    try {
      console.log(`Updating order ${id} payment status to: ${paymentStatus}`);
      const order = await Order.findByIdAndUpdate(
        id,
        { paymentStatus },
        { new: true }
      );

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      console.error(`Error updating order ${id} payment status:`, error);
      throw new Error(`Database error while updating payment status: ${error.message}`);
    }
  }

  /**
   * Cancel an order and restore product quantities
   * @param {string} id Order ID
   * @returns {Promise<Object>} Cancelled order
   */
  async cancelOrder(id) {
    try {
      console.log(`Cancelling order ${id}`);
      const order = await Order.findById(id);

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'delivered') {
        throw new Error('Cannot cancel an order that has already been delivered');
      }

      // Restore product quantities
      for (const item of order.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } }
        );
      }

      // Update order status
      order.status = 'cancelled';
      await order.save();

      console.log(`Order ${id} cancelled successfully`);
      return order;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    }
  }
}

module.exports = new OrderService();