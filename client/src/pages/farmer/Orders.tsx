import { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "@/api/orders";
import { Order } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/useToast";
import api from "@/api/api";

export function FarmerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getOrders();
        console.log("Farmer orders response:", response);
        setOrders(response.orders);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error fetching orders",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const handleStatusUpdate = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      toast({
        title: "Order status updated",
        description: response.message,
      });

      // Update order in state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Add a function to create a test order
  const createTestOrder = async () => {
    try {
      setLoading(true);
      const response = await api.post('/orders/seed-test-order');
      toast({
        title: "Test order created",
        description: "A test order has been created successfully.",
      });

      // Refresh the orders list
      const updatedOrders = await getOrders();
      setOrders(updatedOrders.orders);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating test order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "shipped":
        return "outline";
      case "delivered":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        {process.env.NODE_ENV !== 'production' && (
          <Button onClick={createTestOrder} disabled={loading}>
            Create Test Order
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-muted-foreground mt-2">
                When vendors place orders for your products, they will appear here.
              </p>
              {process.env.NODE_ENV !== 'production' && (
                <Button onClick={createTestOrder} className="mt-4">
                  Create Test Order
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order #{order._id.substring(order._id.length - 8)}</CardTitle>
                    <CardDescription>
                      Placed by {order.buyerName} on {new Date(order.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Products</h4>
                    <div className="space-y-2">
                      {order.products.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>
                            {item.productName} ({item.quantity} units)
                          </span>
                          <span>${(item.quantity * item.pricePerUnit).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <p className="text-sm">{order.shippingAddress}</p>
                  </div>
                  {order.notes && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <span className="text-sm mr-2">Change Status:</span>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusUpdate(order._id, value as Order["status"])}
                    disabled={order.status === "delivered"}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-x-2">
                  {order.status === "pending" && (
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(order._id, "cancelled")}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {order.status === "pending" && (
                    <Button
                      onClick={() => handleStatusUpdate(order._id, "confirmed")}
                    >
                      Confirm Order
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}