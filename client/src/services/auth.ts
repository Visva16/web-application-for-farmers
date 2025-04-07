import { api } from '@/api/api';
import { UserRole } from '@/types/user';

/**
 * Authenticates a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Authentication data including token and user info
 */
export const login = async (email: string, password: string) => {
  try {
    console.log('Making POST request to:', '/auth/login', { email, password });
    const response = await api.post('/auth/login', { email, password });
    console.log('Response from /auth/login:', response);
    console.log('User logged in successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data, error);
    console.error('Login error:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

/**
 * Registers a new user
 * @param userData User data including email, password, role, businessName, location, and city
 * @returns Registration result
 */
export const registerUser = async (userData: {
  email: string;
  password: string;
  role: string;
  businessName: string;
  location: string;
  city?: string;
}) => {
  try {
    console.log('Making registration request with data:', { ...userData, password: '******' });
    console.log('API endpoint being called:', '/auth/register');
    const response = await api.post('/auth/register', userData);
    console.log('Registration successful');
    return response.data;
  } catch (error) {
    console.error('Registration API error:', error);
    console.error('Response data:', error?.response?.data);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

/**
 * Legacy registration function that combines parameters
 */
export const register = async (
  email: string,
  password: string,
  role: UserRole,
  businessName: string,
  location: string,
  city?: string
) => {
  return registerUser({ email, password, role, businessName, location, city });
};

/**
 * Fetches current user profile information
 * @returns User profile data
 */
export const getCurrentUser = async () => {
  try {
    console.log('Fetching current user profile');
    const response = await api.get('/auth/me');
    console.log('Current user data retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

/**
 * Updates user profile information
 * @param userData Profile data to update
 * @returns Updated profile data
 */
export const updateProfile = async (userData: {
  businessName?: string;
  location?: string;
  city?: string;
}) => {
  try {
    console.log('Updating user profile with data:', userData);
    const response = await api.put('/auth/profile', userData);
    console.log('Profile updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

/**
 * Logs out the current user
 */
export const logout = async () => {
  try {
    console.log('Logging out user');
    await api.post('/auth/logout');
    console.log('User logged out successfully');
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};

/**
 * Refreshes the authentication token
 * @returns New authentication data
 */
export const refreshToken = async () => {
  try {
    console.log('Refreshing authentication token');
    const response = await api.post('/auth/refresh-token');
    console.log('Token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new Error(error?.response?.data?.error || error.message);
  }
};