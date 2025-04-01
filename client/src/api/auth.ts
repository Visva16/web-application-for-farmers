import api from './api';

type UserRole = 'vendor' | 'farmer';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
  userId: string;
  email: string;
  businessName: string;
  location: string;
}

// Description: Login user
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string, role: UserRole, userId: string, email: string, businessName: string, location: string }
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
      role: response.data.role,
      userId: response.data.userId,
      email: response.data.email,
      businessName: response.data.businessName,
      location: response.data.location
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string, role: UserRole, businessName: string, location: string }
// Response: { user: Object, accessToken: string, refreshToken: string }
export const registerUser = async (userData: {
  email: string;
  password: string;
  role: string;
  businessName: string;
  location: string;
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

// Legacy registration function - keeping for backward compatibility
export const register = async (
  email: string,
  password: string,
  role: UserRole,
  businessName: string,
  location: string
) => {
  return registerUser({ email, password, role, businessName, location });
};

// Description: Refresh access token
// Endpoint: POST /api/auth/refresh
// Request: { refreshToken: string }
// Response: { accessToken: string, refreshToken: string }
export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/auth/refresh', { refreshToken });
    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Logout user
// Endpoint: POST /api/auth/logout
// Request: { refreshToken: string }
// Response: { success: boolean }
export const logout = async (): Promise<{ success: boolean }> => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};