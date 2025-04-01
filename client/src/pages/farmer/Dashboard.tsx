import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrders } from "@/api/orders";
import { getProducts } from "@/api/products";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { Order, Product } from "@/api/types";
import { Badge } from "@/components/ui/badge";

export function FarmerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

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
      title: "Active Listings",
      value: products.length,
      icon: Package,
      description: "Products available for sale"
    },
    {
      title: "Pending Orders",
      value: orders.filter(o => o.status === 'pending').length,
      icon: ShoppingCart,
      description: "Orders awaiting confirmation"
    },
    {
      title: "In Transit",
      value: orders.filter(o => o.status === 'shipped').length,
      icon: Truck,
      description: "Orders being delivered"
    },
    {
      title: "Monthly Revenue",
      value: `$${orders.reduce((acc, order) => acc + order.totalAmount, 0).toFixed(2)}`,
      icon: TrendingUp,
      description: "Revenue this month"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Farmer Dashboard</h1>

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
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="createdAt" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" />
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
                <div key={order._id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{order._id}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}