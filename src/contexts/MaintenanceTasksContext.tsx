import React, { createContext, useContext, ReactNode } from 'react';
import { useMaintenanceTasks } from '@/hooks/useMaintenanceTasks';
import { MaintenanceTask, CreateMaintenanceTaskData } from '@/types/maintenance';

interface MaintenanceTasksContextType {
  tasks: MaintenanceTask[];
  loading: boolean;
  refetch: () => Promise<void>;
  createTask: (taskData: CreateMaintenanceTaskData) => Promise<{ data: any | null; error: any }>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<{ error: any }>;
  completeTask: (id: string, actualHours?: number, notes?: string) => Promise<{ error: any }>;
  deleteTask: (id: string) => Promise<{ error: any }>;
}

const MaintenanceTasksContext = createContext<MaintenanceTasksContextType | undefined>(undefined);

interface MaintenanceTasksProviderProps {
  children: ReactNode;
}

export const MaintenanceTasksProvider = ({ children }: MaintenanceTasksProviderProps) => {
  const maintenanceTasksData = useMaintenanceTasks();

  return (
    <MaintenanceTasksContext.Provider value={maintenanceTasksData}>
      {children}
    </MaintenanceTasksContext.Provider>
  );
};

export const useMaintenanceTasksContext = () => {
  const context = useContext(MaintenanceTasksContext);
  if (context === undefined) {
    throw new Error('useMaintenanceTasksContext must be used within a MaintenanceTasksProvider');
  }
  return context;
};