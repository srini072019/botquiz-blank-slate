
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ROUTES } from "@/constants/routes";
import AuthLayout from "@/layouts/AuthLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

// Define login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    setLoginError(null);
    
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        error instanceof Error 
          ? error.message 
          : "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample user credentials for different roles
  const demoCredentials = [
    {
      role: "Admin",
      email: "admin@example.com",
      password: "password123"
    },
    {
      role: "Instructor",
      email: "instructor@example.com",
      password: "password123"
    },
    {
      role: "Candidate",
      email: "candidate@example.com",
      password: "password123"
    }
  ];

  // Helper function to autofill credentials
  const fillCredentials = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Enter your credentials to access your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {loginError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="you@example.com" 
                    type="email" 
                    autoComplete="email"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link 
                    to={ROUTES.FORGOT_PASSWORD} 
                    className="text-sm font-semibold text-primary hover:text-primary/80"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    autoComplete="current-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link 
              to={ROUTES.REGISTER} 
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </div>
        </form>
      </Form>

      <Card className="mt-8 border-dashed">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <InfoIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            <CardTitle className="text-base">Demo Accounts</CardTitle>
          </div>
          <CardDescription>Use these credentials to test different user roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoCredentials.map((cred, index) => (
              <div 
                key={index} 
                className="text-sm border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fillCredentials(cred.email, cred.password)}
              >
                <div className="font-semibold pb-1">{cred.role}</div>
                <div className="text-muted-foreground">Email: {cred.email}</div>
                <div className="text-muted-foreground">Password: {cred.password}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Login;
