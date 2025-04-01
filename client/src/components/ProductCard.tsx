import { Product } from "@/api/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

export function ProductCard({ product, showActions = true }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-all hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <Badge>{product.category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">${product.price}</div>
          <div className="text-sm text-muted-foreground">
            {product.quantity} available
          </div>
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="gap-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}