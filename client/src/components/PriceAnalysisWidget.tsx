import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getCompetitivePricingByCategory, getProductPricingInsights } from "@/api/priceAnalysis";

interface PriceRange {
  range: string;
  count: number;
  percentage: number;
}

interface TopProduct {
  _id: string;
  name: string;
  price: number;
  seller: string;
  city: string;
}

interface PriceAnalysis {
  count: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  standardDeviation: number;
  priceRanges: PriceRange[];
  topProducts: TopProduct[];
  message: string;
}

interface PricingInsights {
  productId: string;
  productName: string;
  currentPrice: number;
  category: string;
  market: PriceAnalysis;
  marketPosition: 'lowest' | 'highest' | 'below_average' | 'above_average' | 'average' | null;
  priceDifferenceFromAverage: { absolute: number, percentage: number } | null;
  message: string;
}

interface PriceAnalysisWidgetProps {
  productId?: string;
  initialCategory?: string;
  mode?: 'product' | 'category';
}

const PriceAnalysisWidget: React.FC<PriceAnalysisWidgetProps> = ({
  productId,
  initialCategory = 'vegetables',
  mode = 'category',
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>(initialCategory);
  const [productName, setProductName] = useState<string>('');
  const [pricingData, setPricingData] = useState<PriceAnalysis | null>(null);
  const [productInsights, setProductInsights] = useState<PricingInsights | null>(null);
  const { toast } = useToast();

  const categories = [
    'vegetables',
    'fruits',
    'dairy',
    'grains',
    'meat',
    'herbs',
    'nuts',
    'other'
  ];

  useEffect(() => {
    fetchPricingData();
  }, [productId, mode]);

  const fetchPricingData = async () => {
    setLoading(true);
    try {
      if (mode === 'product' && productId) {
        const response = await getProductPricingInsights(productId);
        setProductInsights(response.insights);
        setPricingData(response.insights.market);
      } else {
        const response = await getCompetitivePricingByCategory(category, productName || undefined);
        setPricingData(response.analysis);
        setProductInsights(null);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch pricing data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handleSearch = () => {
    fetchPricingData();
  };

  const getMarketPositionColor = (position: string | null) => {
    switch (position) {
      case 'lowest':
        return 'bg-green-100 text-green-800';
      case 'below_average':
        return 'bg-green-50 text-green-600';
      case 'average':
        return 'bg-gray-100 text-gray-800';
      case 'above_average':
        return 'bg-amber-50 text-amber-600';
      case 'highest':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMarketPosition = (position: string | null) => {
    switch (position) {
      case 'lowest':
        return 'Lowest in Market';
      case 'below_average':
        return 'Below Average';
      case 'average':
        return 'Average';
      case 'above_average':
        return 'Above Average';
      case 'highest':
        return 'Highest in Market';
      default:
        return 'Not Available';
    }
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          {mode === 'product' ? 'Product Price Analysis' : 'Market Price Analysis'}
        </CardTitle>
        <CardDescription>
          {mode === 'product'
            ? 'View pricing insights for this product compared to the market'
            : 'Analyze pricing trends by category in the marketplace'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {mode === 'category' && (
              <div className="flex flex-col space-y-4 mb-4">
                <div className="flex flex-wrap gap-3">
                  <div className="w-full sm:w-auto flex-1">
                    <Select value={category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-auto flex-1">
                    <Input
                      placeholder="Product name (optional)"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
            )}

            {pricingData?.count === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pricing data available for this selection.
              </div>
            ) : (
              <>
                {productInsights && (
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{productInsights.productName}</h3>
                        <p className="text-sm text-muted-foreground">Category: {productInsights.category}</p>
                      </div>
                      <div className="mt-2 md:mt-0 flex items-center gap-3">
                        <div className="text-lg font-semibold">
                          ${productInsights.currentPrice.toFixed(2)}
                        </div>
                        <Badge className={getMarketPositionColor(productInsights.marketPosition)}>
                          {formatMarketPosition(productInsights.marketPosition)}
                        </Badge>
                      </div>
                    </div>

                    {productInsights.priceDifferenceFromAverage && (
                      <div className="flex items-center mt-2 text-sm">
                        <span className="mr-2">Compared to market average:</span>
                        <span className={productInsights.priceDifferenceFromAverage.percentage < 0 
                          ? "text-green-600 flex items-center" 
                          : productInsights.priceDifferenceFromAverage.percentage > 0 
                            ? "text-red-600 flex items-center"
                            : "text-gray-600 flex items-center"
                        }>
                          {productInsights.priceDifferenceFromAverage.percentage < 0 ? (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          ) : productInsights.priceDifferenceFromAverage.percentage > 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : null}
                          {productInsights.priceDifferenceFromAverage.percentage > 0 ? '+' : ''}
                          {productInsights.priceDifferenceFromAverage.percentage.toFixed(1)}% 
                          (${Math.abs(productInsights.priceDifferenceFromAverage.absolute).toFixed(2)})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Lowest Price</p>
                    <p className="text-xl font-semibold text-green-700">${pricingData?.minPrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Average Price</p>
                    <p className="text-xl font-semibold text-blue-700">${pricingData?.averagePrice.toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Highest Price</p>
                    <p className="text-xl font-semibold text-amber-700">${pricingData?.maxPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Price Distribution</h3>
                  {pricingData?.priceRanges.map((range, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span>{range.range}</span>
                        <span>{range.count} items ({range.percentage}%)</span>
                      </div>
                      <Progress value={range.percentage} className="h-2" />
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Similar Products</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {pricingData?.topProducts.map((product) => (
                      <div key={product._id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <div className="overflow-hidden">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.seller} • {product.city}
                          </p>
                        </div>
                        <div className="font-semibold flex items-center">
                          <DollarSign className="h-3 w-3 mr-0.5" />
                          {product.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground text-right">
                  Analysis based on {pricingData?.count} similar products
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceAnalysisWidget;