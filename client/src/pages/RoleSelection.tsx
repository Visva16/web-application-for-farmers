import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Warehouse } from "lucide-react";

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">Choose Your Role</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-colors cursor-pointer backdrop-blur-sm bg-background/80"
            onClick={() => navigate("/login?role=farmer")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-6 w-6" />
                Farmer
              </CardTitle>
              <CardDescription>
                List and sell your produce directly to vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• List your produce with detailed information</li>
                <li>• Set your own prices and quantities</li>
                <li>• Manage orders and deliveries</li>
                <li>• Connect directly with vendors</li>
              </ul>
              <Button className="w-full mt-6">
                Continue as Farmer
              </Button>
            </CardContent>
          </Card>

          <Card
            className="relative overflow-hidden hover:border-primary/50 transition-colors cursor-pointer backdrop-blur-sm bg-background/80"
            onClick={() => navigate("/login?role=vendor")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-6 w-6" />
                Vendor
              </CardTitle>
              <CardDescription>
                Source fresh produce directly from farmers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Browse a wide selection of fresh produce</li>
                <li>• Place orders with multiple farmers</li>
                <li>• Track deliveries in real-time</li>
                <li>• Manage your inventory efficiently</li>
              </ul>
              <Button className="w-full mt-6">
                Continue as Vendor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}