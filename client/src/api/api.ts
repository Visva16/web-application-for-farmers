import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { refreshToken } from './auth';

// Add logging to see the base URL and config
console.log('API base URL:', import.meta.env.VITE_API_BASE_URL || '/api');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});
console.log('API client configuration:', api.defaults);

let accessToken: string | null = null;

// Axios request interceptor: Attach access token to headers
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

// Function to subscribe to the refresh token process
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers that the token has been refreshed
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Axios response interceptor: Handle 401 errors
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

    // If error is 401 and we haven't already attempted to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, wait for the new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
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

        const response = await refreshToken(refreshTokenValue);
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        accessToken = newAccessToken;

        // Update auth header for the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Notify all the requests waiting for the token
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        isRefreshing = false;

        // Clear tokens if refresh fails
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        accessToken = null;

        // Redirect to login
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;