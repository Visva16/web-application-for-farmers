import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "@/api/products";
import { Product } from "@/api/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { OrderForm } from "@/components/OrderForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Truck, Award } from "lucide-react";
import { Label } from "@/components/ui/label";

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { userInfo, userRole } = useAuth();
  const navigate = useNavigate();

  // Add these debug logs
  console.log("ProductDetails component rendered");
  console.log("Auth context in ProductDetails:", useAuth());
  console.log("User from auth context:", userInfo);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await getProductById(id);
          setProduct(response.product);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to load product",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleOrderClick = () => {
    console.log("Order Now button clicked - Current user:", userInfo);
    console.log("Product details:", product);

    // Check if userInfo is defined before proceeding
    if (!userInfo || !userInfo.role) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (userInfo.role !== 'vendor') {
      toast({
        title: "Permission Denied",
        description: "Only vendors can place orders",
        variant: "destructive",
      });
      return;
    }

    console.log("Setting showOrderForm to true");
    setShowOrderForm(true);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[500px]">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Product Not Found</CardTitle>
            <CardDescription>The product you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showOrderForm) {
    return (
      <div className="container mx-auto py-8">
        <OrderForm
          productId={product._id}
          productName={product.name}
          sellerId={product.sellerId}
          sellerName={product.sellerName}
          price={product.price}
          quantity={product.quantity}
          onCancel={() => setShowOrderForm(false)}
        />
      </div>
    );
  }

  // Simplified logic - vendors can order any product regardless of ownership
  const isVendor = userRole === 'vendor';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image Available
            </div>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images && product.images.slice(1).map((image, i) => (
            <div key={i} className="aspect-square overflow-hidden rounded-lg border">
              <img
                src={image}
                alt={`${product.name} ${i + 2}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge>{product.category}</Badge>
            {product.certificationType && (
              <Badge variant="secondary">
                <Award className="mr-1 h-3 w-3" />
                {product.certificationType}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-3xl font-bold">${product.price}</div>
          <p className="text-sm text-muted-foreground">
            {product.quantity} units available
          </p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Minimum order: {product.minimumOrder} units</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Free shipping on bulk orders</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={product.minimumOrder || 1}
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          {isVendor ? (
            <Button
              className="w-full"
              onClick={handleOrderClick}
              disabled={product.quantity <= 0}
            >
              Order Now
            </Button>
          ) : (
            <Button className="w-full" onClick={handleOrderClick}>
              Add to Cart
            </Button>
          )}
        </div>

        <div className="prose prose-sm">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        {product.bulkDiscounts && product.bulkDiscounts.length > 0 && (
          <div>
            <h3 className="font-semibold">Bulk Discounts</h3>
            <ul className="mt-2 space-y-2">
              {product.bulkDiscounts.map((discount, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>{discount.quantity}+ units</span>
                  <span className="font-medium">${discount.price} per unit</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}