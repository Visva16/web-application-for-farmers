import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Settings,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userType: 'vendor' | 'farmer';
}

export function Sidebar({ userType }: SidebarProps) {
  // Define navigation items explicitly with NO discussion related items
  const vendorItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: `/vendor` },
    { icon: Store, label: 'Marketplace', href: '/marketplace' },
    { icon: ShoppingCart, label: 'Orders', href: `/vendor/orders` },
    { icon: MessageSquare, label: 'Discussions', href: '/discussions' },
    { icon: Settings, label: 'Settings', href: `/vendor/profile` },
  ];

  const farmerItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: `/farmer` },
    { icon: Store, label: 'Marketplace', href: '/marketplace' },
    { icon: Package, label: 'Products', href: `/farmer/products` },
    { icon: ShoppingCart, label: 'Orders', href: `/farmer/orders` },
    { icon: MessageSquare, label: 'Discussions', href: '/discussions' },
    { icon: Settings, label: 'Settings', href: `/farmer/profile` },
  ];

  // Choose the appropriate items based on user role
  const navItems = userType === 'vendor' ? vendorItems : farmerItems;

  return (
    <div className="w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === `/${userType}`}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}