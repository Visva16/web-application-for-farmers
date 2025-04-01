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

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/vendor" replace />} />
              {/* Common routes for both roles */}
              <Route path="marketplace" element={<Marketplace />} />
              <Route path="product/:id" element={<ProductDetails />} />

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