import api from './api';

// Description: Get products by city from farmers
// Endpoint: GET /api/farmers/products-by-city/:city
// Request: city (path parameter)
// Response: { products: Array<Product> }
export const getProductsByCity = async (city: string) => {
  try {
    // Fixed API path - removed the redundant "/api" prefix
    const response = await api.get(`/farmers/products-by-city/${encodeURIComponent(city)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products by city:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all unique cities where farmers are located
// Endpoint: GET /api/farmers/cities
// Request: {}
// Response: { cities: string[] }
export const getFarmerCities = async () => {
  try {
    const response = await api.get('/farmers/cities');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching farmer cities:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};