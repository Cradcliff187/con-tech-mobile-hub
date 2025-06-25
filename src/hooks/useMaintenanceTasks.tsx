
import { useState, useEffect } from 'react';
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
import { useImprovedMaintenanceTaskSubscription } from '@/hooks/maintenance/useImprovedMaintenanceTaskSubscription';

export const useMaintenanceTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Use improved real-time subscription
  useImprovedMaintenanceTaskSubscription({
    user,
    onTasksUpdate: (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    }
  });

  const refetch = async () => {
    // Real-time subscription handles automatic updates, but this is kept for compatibility
    console.log('Manual refetch called - real-time subscription should handle updates automatically');
  };

  const createTask = async (taskData: CreateMaintenanceTaskData) => {
    if (!user?.id) return { data: null, error: 'User not authenticated' };

    try {
      const data = await createMaintenanceTask(taskData, user.id);
      toast({
        title: "Success",
        description: "Maintenance task created successfully"
      });
      // Real-time subscription will handle state update
      return { data, error: null };
    } catch (error) {
      console.error('Error creating maintenance task:', error);
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
      // Real-time subscription will handle state update
      return { error: null };
    } catch (error) {
      console.error('Error updating maintenance task:', error);
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
      // Real-time subscription will handle state update
      return { error: null };
    } catch (error) {
      console.error('Error completing maintenance task:', error);
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
      // Real-time subscription will handle state update
      return { error: null };
    } catch (error) {
      console.error('Error deleting maintenance task:', error);
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
