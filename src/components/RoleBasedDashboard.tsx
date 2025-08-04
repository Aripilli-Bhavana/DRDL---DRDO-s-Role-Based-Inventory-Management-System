import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  Package, 
  Users, 
  AlertTriangle, 
  Eye, 
  Plus, 
  FileText, 
  BarChart3,
  Search,
  Clock,
  CheckCircle,
  Calendar,
  Settings,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface DashboardProps {
  userRole: 'admin' | 'division_personnel' | 'scientist';
  userName: string;
  division: string;
}

const RoleBasedDashboard = ({ userRole, userName, division }: DashboardProps) => {
  const { profile } = useAuth();
  const { 
    inventory, 
    requests, 
    activityLogs, 
    loading: dataLoading,
    getDivisionStats,
    getAllDivisionStats,
    logActivity 
  } = useSupabaseData();

  // Get role-based data with strict access control
  const divisionStats = userRole === 'admin' ? getAllDivisionStats() : [getDivisionStats(division)];

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-secondary/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  const getDivisionColor = (div: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-division-a',
      'B': 'bg-division-b', 
      'C': 'bg-division-c',
      'D': 'bg-division-d',
      'E': 'bg-division-e',
      'F': 'bg-division-f',
      'G': 'bg-division-g',
      'H': 'bg-division-h'
    };
    return colors[div] || 'bg-division-a';
  };

  const getRoleConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          title: 'Administrator Dashboard',
          badge: 'SUPREME ADMIN ACCESS',
          badgeColor: 'bg-gradient-to-r from-drdo-orange to-drdo-red text-white',
          actions: [
            { icon: Users, label: 'Manage Users', description: 'Add/edit user accounts', link: '/admin/users' },
            { icon: BarChart3, label: 'System Analytics', description: 'View comprehensive reports', link: '/analytics' },
            { icon: FileText, label: 'Global Audit Logs', description: 'All system activities', link: '/logs' },
            { icon: Package, label: 'All Inventories', description: 'Cross-division access', link: '/inventory/view' }
          ]
        };
      case 'division_personnel':
        return {
          title: `Division ${division} Control Panel`,
          badge: `DIVISION ${division} PERSONNEL`,
          badgeColor: getDivisionColor(division) + ' text-white',
          actions: [
            { icon: Plus, label: 'Add Inventory', description: 'Add new items to division', link: '/inventory/add' },
            { icon: Package, label: 'Manage Inventory', description: 'Edit/delete division items', link: '/inventory/view' },
            { icon: CheckCircle, label: 'Approve Requests', description: 'Handle scientist requests', link: '/requests/approve' },
            { icon: FileText, label: 'Division Logs', description: 'View division activity', link: '/logs' }
          ]
        };
      case 'scientist':
        return {
          title: `Division ${division} Research Access`,
          badge: `SCIENTIST - DIVISION ${division}`,
          badgeColor: 'bg-gradient-to-r from-drdo-blue to-drdo-navy text-white',
          actions: [
            { icon: Eye, label: 'View Inventory', description: 'Browse available items', link: '/inventory/view' },
            { icon: Search, label: 'Search Items', description: 'Find specific equipment', link: '/inventory/search' },
            { icon: Plus, label: 'Request Items', description: 'Submit access requests', link: '/requests' },
            { icon: Clock, label: 'My Requests', description: 'Track request status', link: '/requests/status' }
          ]
        };
      default:
        return {
          title: 'Dashboard',
          badge: 'USER',
          badgeColor: 'bg-muted text-muted-foreground',
          actions: []
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary shadow-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{config.title}</h1>
                <p className="text-muted-foreground">Welcome back, {userName}</p>
              </div>
            </div>
            <Badge className={`${config.badgeColor} px-3 py-1`}>
              {config.badge}
            </Badge>
          </div>
          
          {/* Security Status Bar */}
          <div className="flex items-center gap-4 p-4 bg-status-secure/10 border border-status-secure/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-status-secure rounded-full animate-pulse" />
              <span className="text-sm font-medium text-status-secure">System Secure</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last Login: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {userRole === 'admin' ? (
          // Admin sees all division stats
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {divisionStats.map((stats) => (
              <Card key={stats.division} className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={`${getDivisionColor(stats.division)} text-white px-2 py-1 text-xs`}>
                      DIV {stats.division}
                    </Badge>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-bold">{stats.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Qty</p>
                      <p className="font-bold text-primary">{stats.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Active</p>
                      <p className="font-bold text-status-secure">{stats.activeItems}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Maint</p>
                      <p className="font-bold text-status-warning">{stats.maintenanceItems}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Division personnel and scientists see their division stats
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold text-foreground">{divisionStats[0]?.totalItems || 0}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Quantity</p>
                    <p className="text-2xl font-bold text-primary">{divisionStats[0]?.totalQuantity || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Items</p>
                    <p className="text-2xl font-bold text-status-secure">{divisionStats[0]?.activeItems || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-status-secure" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance</p>
                    <p className="text-2xl font-bold text-status-warning">{divisionStats[0]?.maintenanceItems || 0}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-status-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cal. Overdue</p>
                    <p className="text-2xl font-bold text-destructive">{divisionStats[0]?.overdueCalibrations || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cal. Due</p>
                    <p className="text-2xl font-bold text-status-warning">{divisionStats[0]?.dueCalibrations || 0}</p>
                  </div>
                  <Settings className="h-8 w-8 text-status-warning" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {config.actions.map((action, index) => (
            <Card key={index} className="border-0 shadow-lg bg-card/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <action.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{action.label}</h3>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Inventory Table */}
        <Card className="mb-8 border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {userRole === 'admin' ? 'All Division Inventories' : `Division ${division} Inventory`}
              <Badge className="ml-2 bg-drdo-orange text-white">
                {inventory.length} Items
              </Badge>
            </CardTitle>
            <CardDescription>
              {userRole === 'scientist' 
                ? `View-only access to Division ${division} inventory` 
                : userRole === 'admin'
                ? 'Complete access to all division inventories'
                : `Manage Division ${division} inventory items and track status`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-drdo-navy/5">
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    {userRole === 'admin' && <TableHead>Division</TableHead>}
                    {userRole === 'admin' && <TableHead>Added By</TableHead>}
                    {userRole === 'admin' && <TableHead>Scientist</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead>Calibration</TableHead>
                    <TableHead>Cal. Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    {userRole !== 'scientist' && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.slice(0, userRole === 'admin' ? 15 : 10).map((item) => (
                    <TableRow key={item.id} className="hover:bg-drdo-navy/5">
                      <TableCell className="font-medium text-drdo-navy">{item.item_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-drdo-blue text-drdo-blue">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{item.quantity}</TableCell>
                      <TableCell className="text-drdo-navy/70">{item.location}</TableCell>
                      {userRole === 'admin' && (
                        <TableCell>
                          <Badge className={`${getDivisionColor(item.division_id)} text-white text-xs`}>
                            DIV {item.division_id}
                          </Badge>
                        </TableCell>
                      )}
                      {userRole === 'admin' && (
                        <TableCell className="text-sm text-drdo-navy/70">
                          {item.profiles?.name || 'Unknown'}
                        </TableCell>
                      )}
                      {userRole === 'admin' && (
                        <TableCell className="text-sm text-drdo-navy/70">
                          {item.scientist_profile?.name || 'Unassigned'}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={
                          item.status === 'active' ? 'default' : 
                          item.status === 'maintenance' ? 'destructive' : 'secondary'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(item.calibration_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.calibration_status === 'current' ? 'default' :
                          item.calibration_status === 'due' ? 'secondary' : 'destructive'
                        } className={
                          item.calibration_status === 'current' ? 'bg-status-secure text-white' :
                          item.calibration_status === 'due' ? 'bg-status-warning text-white' : 'bg-destructive text-white'
                        }>
                          {item.calibration_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(item.last_updated).toLocaleDateString()}</TableCell>
                      {userRole !== 'scientist' && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="border-drdo-blue text-drdo-blue hover:bg-drdo-blue hover:text-white">
                              Edit
                            </Button>
                            {userRole === 'admin' && (
                              <Button variant="destructive" size="sm">Delete</Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {inventory.length > (userRole === 'admin' ? 15 : 10) && (
              <div className="mt-4 text-center">
                <Button variant="outline" className="border-drdo-navy text-drdo-navy hover:bg-drdo-navy hover:text-white">
                  View All {inventory.length} Items
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Management (for admins and division personnel) */}
        {(userRole === 'admin' || userRole === 'division_personnel') && requests.length > 0 && (
          <Card className="mb-8 border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Pending Requests
                <Badge className="bg-status-warning text-white">
                  {requests.filter(r => r.status === 'pending').length} Pending
                </Badge>
              </CardTitle>
              <CardDescription>
                Review and approve scientist requests for equipment access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-drdo-navy/5">
                    <TableHead>Scientist</TableHead>
                    <TableHead>Item Requested</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.slice(0, 5).map((request) => (
                    <TableRow key={request.id} className="hover:bg-drdo-navy/5">
                      <TableCell className="font-medium">{request.profiles?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-drdo-navy">{request.item_requested}</TableCell>
                      <TableCell className="font-semibold">{request.quantity}</TableCell>
                      <TableCell className="text-drdo-navy/70">{request.reason}</TableCell>
                      <TableCell>
                        <Badge variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'approved' ? 'default' : 'destructive'
                        }>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(request.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" className="bg-status-secure hover:bg-status-secure/80">
                              Approve
                            </Button>
                            <Button variant="destructive" size="sm">
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs */}
        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
              <Badge className="ml-2 bg-drdo-blue text-white">
                {activityLogs.length} Events
              </Badge>
            </CardTitle>
            <CardDescription>
              {userRole === 'admin' ? 'System-wide activity logs' : `Division ${division} activity logs`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-4 bg-drdo-navy/5 rounded-lg">
                  <div className="p-2 rounded-full bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{log.action}</p>
                    <p className="text-sm text-muted-foreground">
                      by {log.profiles?.name || 'Unknown'} • {new Date(log.created_at).toLocaleString()}
                    </p>
                    {log.details && (
                      <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                    )}
                  </div>
                  <Badge className={`${getDivisionColor(log.division_id)} text-white text-xs`}>
                    DIV {log.division_id}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;