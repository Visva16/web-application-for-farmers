import api from './api';
import { Product } from './types';

// Description: Get all products in the marketplace
// Endpoint: GET /api/products
// Response: { success: true, products: Product[] }
export const getProducts = async (filters = {}) => {
  try {
    // Convert filters object to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get(`/products${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get product details by ID
// Endpoint: GET /api/products/:id
// Response: { success: boolean, product: Product }
export const getProductById = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get product details
// Endpoint: GET /api/products/:id
// Response: { success: true, product: Product }
export const getProductDetails = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Create a new product
// Endpoint: POST /api/products
// Request: Omit<Product, '_id'>
// Response: { success: true, product: Product, message: string }
export const createProduct = async (product: Omit<Product, '_id'>) => {
  try {
    const response = await api.post('/products', product);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};