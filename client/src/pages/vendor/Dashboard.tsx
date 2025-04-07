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
import { getCompetitivePricingByCategory } from "@/api/priceAnalysis";
import { toast } from "@/hooks/useToast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function VendorDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [priceAnalysisData, setPriceAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders(),
          getProducts()
        ]);
        setOrders(ordersData.orders);
        setProducts(productsData.products);

        // If we have products, fetch price analysis for the first product's category
        if (productsData.products && productsData.products.length > 0) {
          fetchPriceAnalysisData(productsData.products[0].category);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load dashboard data"
        });
      }
    };
    fetchData();
  }, []);

  const fetchPriceAnalysisData = async (category: string) => {
    try {
      setIsLoadingAnalysis(true);
      console.log(`Fetching price analysis data for category: ${category}`);
      const response = await getCompetitivePricingByCategory(category);
      setPriceAnalysisData(response.analysis);
    } catch (error) {
      console.error("Error fetching price analysis data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load price analysis data"
      });
      setPriceAnalysisData(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

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

      <Card>
        <CardHeader>
          <CardTitle>Competitive Pricing Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAnalysis ? (
            <div className="flex items-center justify-center h-[200px]">
              <p>Loading price analysis data...</p>
            </div>
          ) : priceAnalysisData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Average Price</div>
                  <div className="text-2xl font-bold">${priceAnalysisData.averagePrice}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Price Range</div>
                  <div className="text-2xl font-bold">${priceAnalysisData.minPrice} - ${priceAnalysisData.maxPrice}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Similar Products</div>
                  <div className="text-2xl font-bold">{priceAnalysisData.count}</div>
                </div>
              </div>

              {priceAnalysisData.priceRanges && priceAnalysisData.priceRanges.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Price Distribution</h3>
                  {priceAnalysisData.priceRanges.map((range, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between text-sm">
                        <span>{range.range}</span>
                        <span>{range.count} products ({range.percentage}%)</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full mt-1">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${range.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {priceAnalysisData.topProducts && priceAnalysisData.topProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Top Competitive Products</h3>
                  <div className="space-y-2">
                    {priceAnalysisData.topProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex justify-between items-center p-2 border rounded hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Sold by {product.seller} • {product.city}
                          </div>
                        </div>
                        <div className="font-bold">${product.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Select category:</span>
                  <Select
                    value={selectedCategory || (products.length > 0 ? products[0].category : '')}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      fetchPriceAnalysisData(value);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(products.map(p => p.category))].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (products.length > 0) {
                        fetchPriceAnalysisData(selectedCategory || products[0].category);
                      }
                    }}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" />
                    Refresh Analysis
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px]">
              <p className="mb-4 text-muted-foreground">No pricing analysis data available</p>
              <Button
                onClick={() => {
                  if (products.length > 0) {
                    fetchPriceAnalysisData(products[0].category);
                  }
                }}
                disabled={products.length === 0}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Run Price Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}