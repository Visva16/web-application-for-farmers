import { useEffect, useState } from "react";
import { getProducts } from "@/api/products";
import { getProductsByCity, getFarmerCities } from "@/api/farmers";
import { Product } from "@/api/types";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCity, setSelectedCity] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const { toast } = useToast();

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { products } = await getProducts();
      setProducts(products);
      setFilteredProducts(products);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available cities
  const fetchCities = async () => {
    try {
      const { cities } = await getFarmerCities();
      console.log("Cities loaded:", cities);
      setCities(cities);

      if (cities.length === 0) {
        setShowManualSearch(true);
      }
    } catch (error: any) {
      console.error("Failed to fetch cities:", error);
      setShowManualSearch(true);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch cities",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCities();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleCityChange = async (city: string) => {
    setSelectedCity(city);
    setManualCity("");

    if (!city || city === "all") {
      // If "All Cities" is selected, reset to showing all products
      await fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const data = await getProductsByCity(city);
      console.log(`Products from ${city}:`, data.products);
      setProducts(data.products);

      if (data.products.length === 0) {
        toast({
          title: "No Results",
          description: `No products found from farmers in ${city}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualCitySearch = async () => {
    if (!manualCity.trim()) {
      toast({
        title: "City Required",
        description: "Please enter a city name to search",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getProductsByCity(manualCity.trim());
      console.log(`Products from ${manualCity}:`, data.products);
      setProducts(data.products);
      setSelectedCity("");

      if (data.products.length === 0) {
        toast({
          title: "No Results",
          description: `No products found from farmers in ${manualCity}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCityFilter = () => {
    setSelectedCity("");
    setManualCity("");
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketplace</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="meat">Meat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city-filter" className="text-sm font-medium">
          Filter by Farmer City
        </Label>

        {cities.length > 0 && (
          <div className="flex gap-2">
            <Select
              value={selectedCity}
              onValueChange={handleCityChange}
              disabled={loading}
              className="flex-1"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(selectedCity || manualCity) && (
              <Button variant="outline" onClick={resetCityFilter} disabled={loading}>
                Clear Filter
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center mt-2">
          <Button
            variant="link"
            onClick={() => setShowManualSearch(!showManualSearch)}
            className="p-0 text-sm"
          >
            {showManualSearch ? "Hide manual search" : "Can't find your city? Enter manually"}
          </Button>
        </div>

        {showManualSearch && (
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Enter city name..."
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleManualCitySearch();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleManualCitySearch}
              disabled={loading || !manualCity.trim()}
            >
              Search
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-full text-center py-10">Loading products...</p>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center py-10 text-muted-foreground">
            No products found
          </p>
        )}
      </div>
    </div>
  );
}