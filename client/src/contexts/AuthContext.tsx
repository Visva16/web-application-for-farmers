import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshToken } from "@/api/auth";

type UserRole = 'vendor' | 'farmer';

interface UserInfo {
  userId?: string;
  email?: string;
  businessName?: string;
  location?: string;
  city?: string;
  _id?: string;
  role?: UserRole;
}

type AuthContextType = {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userInfo: UserInfo;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, businessName: string, location: string, city?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [loading, setLoading] = useState(true);

  // Function to load user from localStorage token
  const loadUserFromToken = async () => {
    console.log("loadUserFromToken called");
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      console.log("Token from localStorage:", token ? "Found token" : "No token");

      if (token) {
        console.log("Auth token found in localStorage, attempting to load user data");

        // Extract user data from token
        try {
          // Split the token and get the payload
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));

          const payload = JSON.parse(jsonPayload);
          console.log("Extracted payload from token:", payload);

          // Set user from token payload
          const userInfo = {
            _id: payload.userId,
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            businessName: payload.businessName,
            location: payload.location,
            city: payload.city
          };

          setUserInfo(userInfo);
          setUserRole(payload.role);
          setIsAuthenticated(true);
          console.log("User data set from token:", payload);
          // Add a log after setting the user
          console.log("User state after setting from token:", userInfo);
        } catch (error) {
          console.error("Error parsing token:", error);
          // If token parsing fails, attempt to refresh the token
          try {
            await refreshToken();
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            // Clear auth data if refresh fails
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userInfo");
            setIsAuthenticated(false);
            setUserRole(null);
            setUserInfo({});
          }
        }
      } else {
        console.log("No auth token found in localStorage");
        setUserInfo({});
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Error loading user from token:", error);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo({});
    } finally {
      setLoading(false);
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await apiLogin(email, password);

      if (response?.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        // Store user role from response
        localStorage.setItem("userRole", response.role);
        setUserRole(response.role);

        // Store additional user info
        const userInfo = {
          _id: response.userId,
          userId: response.userId,
          email: response.email,
          role: response.role,
          businessName: response.businessName,
          location: response.location,
          city: response.city
        };
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        setUserInfo(userInfo);

        setIsAuthenticated(true);
        console.log("User logged in successfully:", response);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userInfo");
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo({});
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole, businessName: string, location: string, city?: string) => {
    try {
      setLoading(true);
      const response = await apiRegister(email, password, role, businessName, location, city);

      // Store the access token from successful registration
      if (response.data && response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);

        // Also store user info if available
        if (response.data.user) {
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }

        // Set auth context with user data
        setUserRole(response.data.user.role);
        setUserInfo(response.data.user);
        setIsAuthenticated(true);

        console.log("User registered successfully:", response.data);
        return response;
      } else {
        throw new Error('Invalid response format: missing access token');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userInfo");
      setIsAuthenticated(false);
      setUserRole(null);
      setUserInfo({});
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userInfo, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  console.log("useAuth hook called, context:", context);
  if (!context) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}