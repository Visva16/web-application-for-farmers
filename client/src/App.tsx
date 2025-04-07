import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { RoleSelection } from "./pages/RoleSelection"
import { DashboardLayout } from "./components/DashboardLayout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { VendorDashboard } from "./pages/vendor/Dashboard"
import { VendorOrders } from "./pages/vendor/Orders"
import { FarmerDashboard } from "./pages/farmer/Dashboard"
import { FarmerProducts } from "./pages/farmer/Products"
import { FarmerOrders } from "./pages/farmer/Orders"
import { Marketplace } from "./pages/Marketplace"
import { ProductDetails } from "./pages/ProductDetails"
import { Profile } from "./pages/Profile"
import { Troubleshooting } from "./pages/Troubleshooting"
import { StartupErrorHandler } from "./components/StartupErrorHandler"
import DiscussionsPage from "./pages/DiscussionsPage"
import DiscussionForm from "./pages/DiscussionForm"
import DiscussionThreadPage from "./pages/DiscussionThreadPage"

function App() {
  const [startupError, setStartupError] = useState<string | null>(null);

  useEffect(() => {
    // Check for common startup issues
    const detectStartupIssues = () => {
      try {
        // Add checks here if needed
        return null;
      } catch (error) {
        console.error("Startup error detected:", error);
        return error.message;
      }
    };

    const error = detectStartupIssues();
    if (error) {
      setStartupError(error);
    }
  }, []);

  if (startupError) {
    return <StartupErrorHandler errorMessage={startupError} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            {/* Public routes without StartupErrorHandler */}
            <Route path="/login" element={<Login />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/troubleshooting" element={<Troubleshooting />} />

            {/* Protected routes with StartupErrorHandler */}
            <Route path="/" element={
              <ProtectedRoute>
                <StartupErrorHandler>
                  <DashboardLayout />
                </StartupErrorHandler>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/vendor" replace />} />
              {/* Common routes for both roles */}
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="product/:id" element={<ProductDetails />} />

              {/* Discussion routes */}
              <Route path="discussions" element={<DiscussionsPage />} />
              <Route path="discussions/new" element={<DiscussionForm />} />
              <Route
                path="discussions/:id"
                element={
                  <ProtectedRoute>
                    <DiscussionThreadPage />
                  </ProtectedRoute>
                }
              />
              <Route path="discussions/:id/edit" element={<DiscussionForm />} />

              <Route path="vendor" element={<ProtectedRoute userRole="vendor"><Outlet /></ProtectedRoute>}>
                <Route index element={<VendorDashboard />} />
                <Route path="orders" element={<VendorOrders />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route path="farmer" element={<ProtectedRoute userRole="farmer"><Outlet /></ProtectedRoute>}>
                <Route index element={<FarmerDashboard />} />
                <Route path="products" element={<FarmerProducts />} />
                <Route path="orders" element={<FarmerOrders />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App