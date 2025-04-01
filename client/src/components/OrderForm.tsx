import { useState } from "react";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orders";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface OrderFormProps {
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  price: number;
  quantity: number;
  onCancel: () => void;
}

export function OrderForm({
  productId,
  productName,
  sellerId,
  sellerName,
  price,
  quantity,
  onCancel
}: OrderFormProps) {
  console.log("OrderForm component rendered with props:", {
    productId,
    productName,
    sellerId,
    sellerName,
    price,
    quantity
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Order form submission started");

    if (orderQuantity < 1 || orderQuantity > quantity) {
      console.log(`Order quantity validation failed: ${orderQuantity} (min: 1, max: ${quantity})`);
      toast({
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${quantity}`,
        variant: "destructive"
      });
      return;
    }

    if (!shippingAddress.trim()) {
      console.log("Shipping address validation failed: Empty address");
      toast({
        title: "Shipping address required",
        description: "Please enter a shipping address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Form validation passed, preparing order data");

      const orderData = {
        sellerId,
        sellerName,
        products: [
          {
            productId,
            productName,
            quantity: orderQuantity,
            pricePerUnit: price
          }
        ],
        shippingAddress,
        notes: notes.trim() || undefined
      };

      console.log('Order data prepared:', orderData);
      console.log('Making API call to create order...');

      const response = await createOrder(orderData);
      console.log('Order creation API response:', response);

      toast({
        title: "Order placed successfully",
        description: "You can track your order in the Orders section",
        variant: "default"
      });

      navigate("/vendor/orders");
    } catch (error) {
      console.error('Order creation error details:', error);
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = price * orderQuantity;

  console.log("OrderForm about to render with isSubmitting:", isSubmitting);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Place Order</CardTitle>
        <CardDescription>
          Fill in the details to complete your order
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input id="product" value={productName} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (Available: {quantity})</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={quantity}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per unit</Label>
            <Input id="price" value={`$${price.toFixed(2)}`} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total</Label>
            <Input id="total" value={`$${totalAmount.toFixed(2)}`} readOnly />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Shipping Address*</Label>
            <Textarea
              id="address"
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Enter your shipping address"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any special instructions or notes"
              rows={3}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}