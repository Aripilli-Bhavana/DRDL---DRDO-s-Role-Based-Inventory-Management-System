import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  location: string;
  status: 'active' | 'maintenance' | 'retired';
  division_id: string;
  added_by: string;
  scientist_assigned: string | null;
  calibration_date: string;
  calibration_status: 'current' | 'due' | 'overdue';
  last_updated: string;
  created_at: string;
  profiles?: {
    name: string;
  } | null;
  scientist_profile?: {
    name: string;
  } | null;
}

export interface Request {
  id: string;
  scientist_id: string;
  item_requested: string;
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  division_id: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  action: string;
  user_id: string;
  division_id: string;
  details: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

export interface DivisionStats {
  division: string;
  totalItems: number;
  totalQuantity: number;
  activeItems: number;
  maintenanceItems: number;
  overdueCalibrations: number;
  dueCalibrations: number;
}

export const useSupabaseData = () => {
  const { user, profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          profiles:added_by(name),
          scientist_profile:scientist_assigned(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory((data as any) || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchRequests = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          profiles:scientist_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data as any) || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchActivityLogs = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityLogs((data as any) || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getDivisionStats = (division: string): DivisionStats => {
    const divisionInventory = inventory.filter(item => item.division_id === division);
    
    return {
      division,
      totalItems: divisionInventory.length,
      totalQuantity: divisionInventory.reduce((sum, item) => sum + item.quantity, 0),
      activeItems: divisionInventory.filter(item => item.status === 'active').length,
      maintenanceItems: divisionInventory.filter(item => item.status === 'maintenance').length,
      overdueCalibrations: divisionInventory.filter(item => item.calibration_status === 'overdue').length,
      dueCalibrations: divisionInventory.filter(item => item.calibration_status === 'due').length,
    };
  };

  const getAllDivisionStats = (): DivisionStats[] => {
    const divisions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return divisions.map(division => getDivisionStats(division));
  };

  const logActivity = async (action: string, details?: string) => {
    if (!user || !profile) return;

    try {
      await supabase
        .from('activity_logs')
        .insert({
          action,
          user_id: user.id,
          division_id: profile.division_id || 'ADMIN',
          details
        });
      
      // Refresh activity logs
      fetchActivityLogs();
    } catch (err: any) {
      console.error('Error logging activity:', err.message);
    }
  };

  useEffect(() => {
    if (profile) {
      const fetchData = async () => {
        setLoading(true);
        await Promise.all([
          fetchInventory(),
          fetchRequests(),
          fetchActivityLogs()
        ]);
        setLoading(false);
      };
      
      fetchData();
    }
  }, [profile]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile) return;

    const inventoryChannel = supabase
      .channel('inventory-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory_items'
      }, () => {
        fetchInventory();
      })
      .subscribe();

    const requestsChannel = supabase
      .channel('requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests'
      }, () => {
        fetchRequests();
      })
      .subscribe();

    const logsChannel = supabase
      .channel('logs-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_logs'
      }, () => {
        fetchActivityLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [profile]);

  return {
    inventory,
    requests,
    activityLogs,
    loading,
    error,
    getDivisionStats,
    getAllDivisionStats,
    logActivity,
    refetch: {
      inventory: fetchInventory,
      requests: fetchRequests,
      activityLogs: fetchActivityLogs
    }
  };
};