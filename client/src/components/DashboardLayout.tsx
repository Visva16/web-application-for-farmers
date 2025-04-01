import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (userRole && location.pathname === '/') {
      // Redirect to the correct dashboard based on role
      navigate(`/${userRole}`);
    }
  }, [isAuthenticated, userRole, navigate, location.pathname]);

  if (!isAuthenticated || !userRole) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex h-[calc(100vh-4rem)] pt-16">
        <Sidebar userType={userRole} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}