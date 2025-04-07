import api from './api';

// Description: Get competitive pricing analysis by product category
// Endpoint: GET /api/price-analysis/category/:category
// Request Params: category (string)
// Request Query: productName (string, optional)
// Response: {
//   success: boolean,
//   analysis: {
//     count: number,
//     averagePrice: number,
//     medianPrice: number,
//     minPrice: number,
//     maxPrice: number,
//     standardDeviation: number,
//     priceRanges: Array<{range: string, count: number, percentage: number}>,
//     topProducts: Array<{_id: string, name: string, price: number, seller: string, city: string}>,
//     message: string
//   }
// }
export const getCompetitivePricingByCategory = async (category: string, productName?: string) => {
  try {
    const url = `/price-analysis/category/${category}${productName ? `?productName=${encodeURIComponent(productName)}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching competitive pricing analysis:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get pricing insights for a specific product
// Endpoint: GET /api/price-analysis/product/:productId
// Request Params: productId (string)
// Response: {
//   success: boolean,
//   insights: {
//     productId: string,
//     productName: string,
//     currentPrice: number,
//     category: string,
//     market: {
//       count: number,
//       averagePrice: number,
//       medianPrice: number,
//       minPrice: number,
//       maxPrice: number,
//       standardDeviation: number,
//       priceRanges: Array<{range: string, count: number, percentage: number}>,
//       topProducts: Array<{_id: string, name: string, price: number, seller: string, city: string}>,
//     },
//     marketPosition: 'lowest' | 'highest' | 'below_average' | 'above_average' | 'average' | null,
//     priceDifferenceFromAverage: {absolute: number, percentage: number} | null,
//     demandLevel: 'high' | 'medium' | 'low' | 'unknown',
//     recommendation: string,
//     suggestedPrice: number,
//     message: string
//   }
// }
export const getProductPricingInsights = async (productId: string) => {
  try {
    const response = await api.get(`/price-analysis/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product pricing insights:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get competitive pricing analysis for a specific category
// Endpoint: GET /api/price-analysis/category/:category
// Response: { success: boolean, data: { averagePrice: number, priceRange: { min: number, max: number }, demandLevel: string, recommendation: string } }
export const getCategoryPriceAnalysis = async (category: string) => {
  try {
    const response = await api.get(`/price-analysis/category/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category price analysis:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get pricing insights for a specific product
// Endpoint: GET /api/price-analysis/product/:productId
// Response: { success: boolean, data: { averagePrice: number, priceRange: { min: number, max: number }, demandLevel: string, recommendation: string, competingProducts: number } }
export const getProductInsights = async (productId: string) => {
  try {
    const response = await api.get(`/price-analysis/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product insights:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

// Description: Get competitive pricing analysis for a product category
// Endpoint: GET /api/price-analysis/competitive-pricing/:category
// Response: { success: boolean, averagePrice: number, minPrice: number, maxPrice: number, similarProducts: Array<{_id: string, name: string, price: number, category: string}> }
export const getCompetitivePricing = async (category: string) => {
  try {
    const response = await api.get(`/price-analysis/competitive-pricing/${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching competitive pricing data:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};