import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import RoleBasedDashboard from "@/components/RoleBasedDashboard";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading, signOut } = useAuth();
  const [activeView, setActiveView] = useState<'admin' | 'division' | 'scientist'>('scientist');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of the system.",
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null; // Will redirect to auth
  }

  // Determine available views based on role
  const getAvailableViews = (): ('admin' | 'division' | 'scientist')[] => {
    switch (profile.role) {
      case 'admin':
        return ['admin', 'division', 'scientist'];
      case 'division_personnel':
        return ['division'];
      case 'scientist':
        return ['scientist'];
      default:
        return ['scientist'];
    }
  };

  const availableViews = getAvailableViews();
  
  // Set initial view based on role
  useEffect(() => {
    if (profile.role === 'scientist') {
      setActiveView('scientist');
    } else if (profile.role === 'division_personnel') {
      setActiveView('division');
    } else if (profile.role === 'admin') {
      setActiveView('admin');
    }
  }, [profile.role]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20">
      {/* Navigation Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              {availableViews.includes('admin') && (
                <Button
                  variant={activeView === 'admin' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('admin')}
                  className="text-sm"
                >
                  Admin View
                </Button>
              )}
              {availableViews.includes('division') && (
                <Button
                  variant={activeView === 'division' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('division')}
                  className="text-sm"
                >
                  Division View
                </Button>
              )}
              {availableViews.includes('scientist') && (
                <Button
                  variant={activeView === 'scientist' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('scientist')}
                  className="text-sm"
                >
                  Scientist View
                </Button>
              )}
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <RoleBasedDashboard
          userRole={activeView === 'admin' ? 'admin' : activeView === 'division' ? 'division_personnel' : 'scientist'}
          userName={profile.name}
          division={profile.division_id || 'ADMIN'}
        />
      </div>
    </div>
  );
};

export default Index;