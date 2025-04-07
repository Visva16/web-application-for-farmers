import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { refreshToken } from './auth';

// Log base URL for debugging
console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || '/api');

// Create an Axios instance with session persistence enabled
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensures that cookies (and hence the session) are sent with every request
  withCredentials: true,
  validateStatus: (status) => status >= 200 && status < 300,
});

console.log('API client configuration:', api.defaults);

let accessToken: string | null = null;

// Request interceptor: Attach access token from localStorage to the headers
api.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`, config.data);
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh events
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers with the new token
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Response interceptor: Handle 401 errors and perform token refresh
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    console.error('API Error:', error.response?.data || error.message, error);

    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 error occurs and we haven't retried yet, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is already in progress, queue the request
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshTokenValue = localStorage.getItem('refreshToken');
        if (!refreshTokenValue) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const response = await refreshToken(refreshTokenValue);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

        // Store new tokens
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        accessToken = newAccessToken;

        // Update authorization header for original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Notify all waiting requests with the new token
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // Retry the original request with updated token
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        isRefreshing = false;

        // Clear stored tokens and related user info
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        accessToken = null;

        // Redirect to login page on refresh failure
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
