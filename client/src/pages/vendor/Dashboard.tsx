import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrders } from "@/api/orders";
import { getProducts } from "@/api/products";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Wallet, 
  Store, 
  TrendingDown,
  Clock
} from "lucide-react";
import { Order, Product } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function VendorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getProducts()
      ]);
      setOrders(ordersData.orders);
      setProducts(productsData.products);
    };
    fetchData();
  }, []);

  const stats = [
    {
      title: "Recent Orders",
      value: orders.filter(o => 
        new Date(o.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      icon: Clock,
      description: "Orders in last 30 days"
    },
    {
      title: "Total Spent",
      value: `$${orders.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(2)}`,
      icon: Wallet,
      description: "Total purchases"
    },
    {
      title: "Active Sellers",
      value: [...new Set(orders.map(o => o.sellerId))].length,
      icon: Store,
      description: "Farmers you buy from"
    },
    {
      title: "Pending Orders",
      value: orders.filter(o => o.status === 'pending').length,
      icon: ShoppingCart,
      description: "Orders awaiting delivery"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <Button onClick={() => navigate('/marketplace')}>
          Browse Marketplace
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="createdAt" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="totalAmount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div 
                  key={order._id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate('/vendor/orders')}
                >
                  <div>
                    <div className="font-medium">From {order.sellerName}</div>
                    <div className="text-sm text-muted-foreground">
                      ${order.totalAmount.toFixed(2)} • {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="link" 
              className="w-full mt-4"
              onClick={() => navigate('/vendor/orders')}
            >
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}