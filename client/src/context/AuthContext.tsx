import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../api/api';

interface User {
  email?: string;
  role?: string;
  id?: string;
  exp?: number;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userInfo: User;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('useAuth hook called, context:', {
    isAuthenticated: context.isAuthenticated,
    userRole: context.userRole,
    userInfo: context.userInfo,
    loading: context.loading
  });
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<User>({});
  const [loading, setLoading] = useState<boolean>(true);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    try {
      const decoded: User = jwt_decode(token);
      setUserInfo({
        email: decoded.email,
        role: decoded.role,
        id: decoded.sub || decoded._id,
        exp: decoded.exp
      });
      setUserRole(decoded.role || null);
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Error decoding token:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserInfo({});
    setLoading(false);
  };

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }
      const response = await api.post('/auth/refresh-token', { token: storedRefreshToken });
      if (response.data?.token) {
        login(response.data.token);
        return;
      }
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
    }
  };

  const loadUserFromToken = () => {
    console.log('loadUserFromToken called');
    const token = localStorage.getItem('authToken');
    console.log('Token from localStorage:', token ? 'Found token' : 'No token');
    
    if (token) {
      try {
        console.log('Auth token found, decoding token...');
        const decoded: User = jwt_decode(token);
        console.log('Decoded token:', decoded);
        
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log('Token expired, attempting to refresh');
          refreshToken();
        } else {
          setUserInfo({
            email: decoded.email,
            role: decoded.role,
            id: decoded.sub || decoded._id,
            exp: decoded.exp
          });
          setUserRole(decoded.role || null);
          setIsAuthenticated(true);
          console.log('User data set from token:', decoded);
        }
      } catch (error) {
        console.error('Error processing authentication token:', error);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Set up an interceptor to handle 401 errors by refreshing the token.
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          isAuthenticated
        ) {
          originalRequest._retry = true;
          try {
            await refreshToken();
            const token = localStorage.getItem('authToken');
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Failed to refresh token during request:', refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        userInfo,
        loading,
        login,
        logout,
        refreshToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
