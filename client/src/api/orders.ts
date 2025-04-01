import api from './api';
import { Order } from './types';

// Description: Get all orders for a user
// Endpoint: GET /api/orders
// Response: { success: boolean, orders: Order[] }
export const getOrders = async () => {
  try {
    const response = await api.get('/orders');

    // Only return mock data if there are no real orders AND we're in development
    if (process.env.NODE_ENV === 'development' &&
        (!response.data.orders || response.data.orders.length === 0)) {
      console.log('No orders found, returning mock data for development');

      // Get current user info from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const sellerId = userInfo._id || userInfo.userId || '67c9f8d46e9f066b9bf31757';

      // Check for persisted mock orders in localStorage
      const mockOrdersString = localStorage.getItem('mockOrders');
      if (mockOrdersString) {
        const mockOrders = JSON.parse(mockOrdersString);
        console.log('Using persisted mock orders from localStorage:', mockOrders);
        return {
          success: true,
          orders: mockOrders
        };
      }

      // Create default mock order if none exist
      const defaultMockOrder = {
        _id: '1234567890',
        buyerId: 'vendor123',
        buyerName: 'Sample Vendor',
        sellerId: sellerId,
        sellerName: 'majorproject',
        products: [
          {
            productId: '67ca0850bd6caf68194d0a5d',
            productName: 'mango',
            quantity: 10,
            pricePerUnit: 22
          }
        ],
        totalAmount: 220,
        status: 'pending',
        paymentStatus: 'pending',
        shippingAddress: '123 Test Street, City, Country',
        notes: 'This is a mock order for testing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store the default mock order
      localStorage.setItem('mockOrders', JSON.stringify([defaultMockOrder]));

      return {
        success: true,
        orders: [defaultMockOrder]
      };
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Update order status
// Endpoint: PATCH /api/orders/:id/status
// Request: { status: Order['status'] }
// Response: { success: boolean, order: Order, message: string }
export const updateOrderStatus = async (id: string, status: Order['status']) => {
  try {
    console.log(`Updating order ${id} status to: ${status}`);

    // Special handling for mock order
    if (id === '1234567890') {
      console.log('Handling mock order status update');

      // Get the current mock orders from local storage or create a new array
      const mockOrdersString = localStorage.getItem('mockOrders');
      const mockOrders = mockOrdersString ? JSON.parse(mockOrdersString) : [];

      // Find the mock order and update its status
      const updatedMockOrders = mockOrders.length > 0
        ? mockOrders.map(order => order._id === id ? {...order, status} : order)
        : [{
            _id: '1234567890',
            buyerId: 'vendor123',
            buyerName: 'Sample Vendor',
            sellerId: JSON.parse(localStorage.getItem('userInfo') || '{}')._id || '67c9f8d46e9f066b9bf31757',
            sellerName: 'majorproject',
            products: [
              {
                productId: '67ca0850bd6caf68194d0a5d',
                productName: 'mango',
                quantity: 10,
                pricePerUnit: 22
              }
            ],
            totalAmount: 220,
            status: status, // Use the new status
            paymentStatus: 'pending',
            shippingAddress: '123 Test Street, City, Country',
            notes: 'This is a mock order for testing',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }];

      // Save updated mock orders to local storage
      localStorage.setItem('mockOrders', JSON.stringify(updatedMockOrders));

      // Return a mock response
      return {
        success: true,
        order: updatedMockOrders[0],
        message: 'Order status updated successfully (mock)'
      };
    }

    // For real orders, make the actual API call
    const response = await api.patch(`/orders/${id}/status`, { status });
    console.log('Order status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new order
// Endpoint: POST /api/orders
// Request: { sellerId: string, sellerName: string, products: Array<{ productId: string, productName: string, quantity: number, pricePerUnit: number }>, shippingAddress: string, notes?: string }
// Response: { success: boolean, order: Order, message: string }
export const createOrder = async (orderData: {
  sellerId: string;
  sellerName: string;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
  }>;
  shippingAddress: string;
  notes?: string;
}) => {
  try {
    console.log('createOrder function called with data:', JSON.stringify(orderData, null, 2));

    // Remove the '/api' prefix
    const response = await api.post('/orders', orderData);
    console.log('Order creation successful, response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Order creation error in API function:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get order by ID
// Endpoint: GET /api/orders/:id
// Response: { success: boolean, order: Order }
export const getOrderById = async (id: string) => {
  try {
    // Remove the '/api' prefix
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};