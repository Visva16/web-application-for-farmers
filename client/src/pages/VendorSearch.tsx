import { VendorSearch } from '@/components/VendorSearch';

export function VendorSearchPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Find Vendors</h1>
      <VendorSearch />
    </div>
  );
}