import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Eye, EyeOff, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormData {
  email: string;
  password: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in to DRDO Inventory System.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex gap-8">
        {/* Login Credentials Panel */}
        <div className="w-full max-w-sm">
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="text-center space-y-1 pb-4">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-gray-800">
                <Info className="h-5 w-5" />
                Demo Login Credentials
              </CardTitle>
              <CardDescription className="text-gray-600">
                Use these credentials to test the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Admin Credentials */}
              <div className="space-y-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Administrator
                </Badge>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                  <p><strong>Email:</strong> admin@drdo.gov.in</p>
                  <p><strong>Password:</strong> admin123</p>
                  <p className="text-gray-600 text-xs">Access to all divisions and functions</p>
                </div>
              </div>

              {/* Division Personnel Credentials */}
              <div className="space-y-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Division Personnel
                </Badge>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                  <p><strong>Email:</strong> division.a@drdo.gov.in</p>
                  <p><strong>Password:</strong> division123</p>
                  <p className="text-gray-600 text-xs">Division A management access</p>
                </div>
              </div>

              {/* Scientist Credentials */}
              <div className="space-y-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Scientist
                </Badge>
                <div className="text-sm space-y-1 bg-gray-50 p-3 rounded-md">
                  <p><strong>Email:</strong> scientist.a@drdo.gov.in</p>
                  <p><strong>Password:</strong> scientist123</p>
                  <p className="text-gray-600 text-xs">Division A scientist view only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Auth Section */}
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-white shadow-lg border border-gray-200">
                <Shield className="h-8 w-8 text-gray-700" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Division A Control Panel
            </h1>
            <p className="text-gray-600">
              Welcome back, Rajesh Kumar
            </p>
          </div>

          {/* Auth Card */}
          <Card className="shadow-lg border border-gray-200 bg-white">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-xl flex items-center justify-center gap-2 text-gray-800">
                <Lock className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sign In Tab Button */}
                <div className="flex">
                  <Button 
                    variant="default" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Sign In
                  </Button>
                </div>
                
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-gray-700">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-gray-700">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>Authorized personnel only. All activities are logged and monitored.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;