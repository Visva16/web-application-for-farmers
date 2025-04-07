import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { LogIn, Store, Warehouse } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LoginForm = {
  email: string;
  password: string;
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "vendor";
  const { register, handleSubmit } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-background/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            {role === "vendor" ? (
              <Store className="h-6 w-6" />
            ) : (
              <Warehouse className="h-6 w-6" />
            )}
            <CardTitle>Welcome {role === "vendor" ? "Vendor" : "Farmer"}</CardTitle>
          </div>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: true })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Loading..."
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => navigate("/role-selection")}
          >
            Not a {role}? Change role
          </Button>
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => navigate(`/register?role=${role}`)}
          >
            Don't have an account? Sign up
          </Button>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Having trouble? </span>
            <Link to="/troubleshooting" className="text-primary hover:underline">
              Visit the troubleshooting guide
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}