import api from './api';

// Description: Get vendors by city
// Endpoint: GET /api/vendors/by-city/:city
// Request: city (path parameter)
// Response: { vendors: Array<{ _id: string, businessName: string, location: string, city: string, email: string }> }
export const getVendorsByCity = async (city: string) => {
  try {
    const response = await api.get(`/api/vendors/by-city/${encodeURIComponent(city)}`);
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get all vendors
// Endpoint: GET /api/vendors
// Request: {}
// Response: { vendors: Array<{ _id: string, businessName: string, location: string, city: string, email: string }> }
export const getAllVendors = async () => {
  try {
    const response = await api.get('/api/vendors');
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};