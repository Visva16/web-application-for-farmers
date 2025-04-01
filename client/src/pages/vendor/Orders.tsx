import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";

export function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      const { orders } = await getOrders();
      setOrders(orders);
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status } : order
      ));
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order._id}</CardTitle>
                <Badge>{order.paymentStatus}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </div>
                  <div>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Amount
                  </div>
                  <div>${order.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={(value: Order['status']) => 
                      handleStatusUpdate(order._id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Products
                </div>
                <div className="mt-2 space-y-2">
                  {order.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div>Product #{product.productId}</div>
                      <div>
                        {product.quantity} x ${product.pricePerUnit.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Shipping Address
                </div>
                <div className="mt-1">{order.shippingAddress}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}