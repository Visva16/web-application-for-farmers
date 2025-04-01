import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  userType: 'vendor' | 'farmer';
}

export function Sidebar({ userType }: SidebarProps) {
  const commonItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: `/${userType}` },
    { icon: Store, label: 'Marketplace', href: '/marketplace' },
    { icon: Settings, label: 'Settings', href: `/${userType}/profile` },
  ];

  const roleSpecificItems = userType === 'vendor' ? [
    { icon: ShoppingCart, label: 'Orders', href: `/${userType}/orders` },
  ] : [
    { icon: Package, label: 'Products', href: `/${userType}/products` },
    { icon: ShoppingCart, label: 'Orders', href: `/${userType}/orders` },
  ];

  const navItems = [...commonItems.slice(0, 2), ...roleSpecificItems, commonItems[2]];

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