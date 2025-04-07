import { useState, useEffect } from 'react';
import { getVendorsByCity, getAllVendors } from '@/api/vendors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

type Vendor = {
  _id: string;
  businessName: string;
  location: string;
  city: string;
  email: string;
};

export function VendorSearch() {
  const [city, setCity] = useState('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load all vendors initially
    const loadVendors = async () => {
      try {
        setLoading(true);
        console.log('Making API call to /api/vendors');
        const data = await getAllVendors();
        console.log(`API response received:`, data);
        setVendors(data.vendors);
      } catch (error: any) {
        console.error(`Reset search error:`, error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, [toast]);

  const handleSearch = async () => {
    console.log(`Initiating vendor search for city: ${city.trim()}`);
    if (!city.trim()) {
      console.log('Empty city search attempted');
      toast({
        title: 'City Required',
        description: 'Please enter a city name to search',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      console.log(`Making API call to /api/vendors/by-city/${encodeURIComponent(city.trim())}`);
      const data = await getVendorsByCity(city.trim());
      console.log(`API response received:`, data);
      setVendors(data.vendors);

      if (data.vendors.length === 0) {
        console.log(`No vendors found in ${city}`);
        toast({
          title: 'No Results',
          description: `No vendors found in ${city}`,
        });
      }
    } catch (error: any) {
      console.error(`Search error:`, error);
      toast({
        title: 'Search Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = async () => {
    console.log('Resetting vendor search');
    setCity('');
    setSearched(false);

    try {
      setLoading(true);
      console.log('Making API call to /api/vendors');
      const data = await getAllVendors();
      console.log(`API response received:`, data);
      setVendors(data.vendors);
    } catch (error: any) {
      console.error(`Reset search error:`, error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Vendors by City</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {searched && (
              <Button variant="outline" onClick={resetSearch} disabled={loading}>
                Show All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card key={vendor._id}>
            <CardHeader>
              <CardTitle>{vendor.businessName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Location:</span> {vendor.location}
                </div>
                <div>
                  <span className="font-medium">City:</span> {vendor.city || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Contact:</span> {vendor.email}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {vendors.length === 0 && !loading && (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            {searched ? `No vendors found in ${city}` : 'No vendors available'}
          </div>
        )}
      </div>
    </div>
  );
}