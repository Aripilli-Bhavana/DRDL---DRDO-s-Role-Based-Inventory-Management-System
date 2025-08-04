import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authenticateUser } from "@/data/mockDatabase";

interface LoginProps {
  onLogin: (userRole: 'admin' | 'division_personnel' | 'scientist', userName: string, division: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Authenticate using mock database
    setTimeout(() => {
      const user = authenticateUser(email, password);
      
      if (user) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${user.name}! Accessing ${user.role} dashboard...`,
        });

        // Log the user in with their actual details
        setTimeout(() => {
          onLogin(user.role, user.name, user.division);
        }, 1000);
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "Invalid email or password. Please check your credentials.",
        });
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-secondary p-4">
      <div className="w-full max-w-md">
        {/* DRDO Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            DRDO Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Secure Access • Equipment Monitoring
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Secure Login
            </CardTitle>
            <CardDescription>
              Enter your authorized credentials to access the system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="officer@drdo.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all duration-300 focus:shadow-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Security Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 transition-all duration-300 focus:shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
                variant="secure"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Access Secure System
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground text-center">
                🔒 This is a secure government system. Unauthorized access is prohibited.
                All activities are monitored and logged.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-accent/10 rounded-md border border-accent/20">
          <h3 className="text-sm font-semibold text-accent mb-2">Demo Login Credentials:</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><strong>Admin:</strong> admin@drdo.gov.in / admin123</p>
            <p><strong>Division A Personnel:</strong> divisionA@drdo.gov.in / divA123</p>
            <p><strong>Division B Personnel:</strong> divisionB@drdo.gov.in / divB123</p>
            <p><strong>Division C Personnel:</strong> divisionC@drdo.gov.in / divC123</p>
            <p><strong>Division D Personnel:</strong> divisionD@drdo.gov.in / divD123</p>
            <p><strong>Scientist (Div A):</strong> ananya.gupta@drdo.gov.in / sci123</p>
            <p><strong>Scientist (Div B):</strong> kavita.joshi@drdo.gov.in / sci123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;