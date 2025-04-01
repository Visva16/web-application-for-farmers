const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

class OrderService {
  /**
   * Get all orders based on query parameters
   * @param {Object} query Query parameters for filtering
   * @returns {Promise<Array>} Array of orders
   */
  static async getAll(query = {}) {
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
  static async getByBuyer(userId) {
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
  static async getBySeller(userId) {
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
  static async getById(id) {
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
   * Create a new order
   * @param {Object} orderData Order data
   * @returns {Promise<Object>} Created order
   */
  static async create(orderData) {
    const session = await mongoose.startSession();
    session.startTransaction();

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
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient quantity available for ${product.name}`);
        }

        // Update product quantity
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: -item.quantity } },
          { session }
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
      await order.save({ session });
      
      await session.commitTransaction();
      console.log('Order created successfully:', order._id);
      return order;
    } catch (error) {
      await session.abortTransaction();
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    } finally {
      session.endSession();
    }
  }

  /**
   * Update order status
   * @param {string} id Order ID
   * @param {string} status New status value
   * @returns {Promise<Object>} Updated order
   */
  static async updateStatus(id, status) {
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
  static async updatePaymentStatus(id, paymentStatus) {
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
  static async cancelOrder(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log(`Cancelling order ${id}`);
      const order = await Order.findById(id).session(session);
      
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
          { $inc: { quantity: item.quantity } },
          { session }
        );
      }

      // Update order status
      order.status = 'cancelled';
      await order.save({ session });

      await session.commitTransaction();
      console.log(`Order ${id} cancelled successfully`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      console.error(`Error cancelling order ${id}:`, error);
      throw new Error(`Failed to cancel order: ${error.message}`);
    } finally {
      session.endSession();
    }
  }
}

module.exports = OrderService;