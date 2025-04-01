import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  userRole?: 'vendor' | 'farmer';
}

export function ProtectedRoute({ children, userRole }: ProtectedRouteProps) {
  const { isAuthenticated, userRole: currentUserRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to role selection if no role is set
  if (!currentUserRole && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (userRole && userRole !== currentUserRole) {
    // If user tries to access wrong role's routes, redirect to their correct dashboard
    return <Navigate to={`/${currentUserRole}`} replace />;
  }

  return children || <Outlet />;
}