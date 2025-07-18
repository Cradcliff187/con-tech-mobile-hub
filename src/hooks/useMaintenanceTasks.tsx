
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceTask, CreateMaintenanceTaskData } from '@/types/maintenance';
import {
  fetchMaintenanceTasks,
  createMaintenanceTask,
  updateMaintenanceTask,
  completeMaintenanceTask,
  deleteMaintenanceTask
} from '@/services/maintenanceTaskService';
import { useSubscription } from '@/hooks/useSubscription';

export const useMaintenanceTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchMaintenanceTasks();
      const typedTasks = data.map(task => ({
        ...task,
        checklist_items: Array.isArray(task.checklist_items) 
          ? task.checklist_items 
          : typeof task.checklist_items === 'string' 
            ? JSON.parse(task.checklist_items) 
            : []
      })) as MaintenanceTask[];
      
      setTasks(typedTasks);
    } catch (error) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Handle real-time updates using centralized subscription manager
  const handleMaintenanceTasksUpdate = useCallback((payload: any) => {
    fetchTasks();
  }, [fetchTasks]);

  // Use centralized subscription management
  const { isSubscribed } = useSubscription(
    'maintenance_tasks',
    handleMaintenanceTasksUpdate,
    {
      userId: user?.id,
      enabled: !!user
    }
  );

  // Initial fetch when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user?.id, fetchTasks]);

  const refetch = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: CreateMaintenanceTaskData) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' };

    try {
      const data = await createMaintenanceTask(taskData, user.id);
      toast({
        title: "Success",
        description: "Maintenance task created successfully"
      });
      return { data, error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create maintenance task",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateTask = async (id: string, updates: Partial<MaintenanceTask>) => {
    try {
      await updateMaintenanceTask(id, updates);
      toast({
        title: "Success",
        description: "Maintenance task updated successfully"
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  const completeTask = async (id: string, actualHours?: number, notes?: string) => {
    if (!user?.id) return { error: 'User not authenticated' };

    try {
      await completeMaintenanceTask(id, user.id, actualHours, notes);
      toast({
        title: "Success",
        description: "Maintenance task completed successfully"
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteMaintenanceTask(id);
      toast({
        title: "Success",
        description: "Maintenance task deleted successfully"
      });
      return { error: null };
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete maintenance task",
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    tasks,
    loading,
    refetch,
    createTask,
    updateTask,
    completeTask,
    deleteTask
  };
};
