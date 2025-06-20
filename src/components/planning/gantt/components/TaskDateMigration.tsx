
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface TaskUpdateData {
  start_date?: string;
  due_date?: string;
}

export const migrateTaskDatesToCurrentYear = async (tasks: Task[]) => {
  const currentYear = 2025;
  const updatesNeeded: Array<{ id: string; updateData: TaskUpdateData }> = [];
  
  tasks.forEach(task => {
    const needsUpdate = 
      (task.start_date && new Date(task.start_date).getFullYear() < currentYear) ||
      (task.due_date && new Date(task.due_date).getFullYear() < currentYear);
    
    if (needsUpdate) {
      const updateData: TaskUpdateData = {};
      
      if (task.start_date) {
        const date = new Date(task.start_date);
        date.setFullYear(currentYear);
        updateData.start_date = date.toISOString().split('T')[0];
      }
      
      if (task.due_date) {
        const date = new Date(task.due_date);
        date.setFullYear(currentYear);
        updateData.due_date = date.toISOString().split('T')[0];
      }
      
      updatesNeeded.push({ id: task.id, updateData });
    }
  });
  
  if (updatesNeeded.length > 0) {
    console.log(`Migrating ${updatesNeeded.length} tasks to ${currentYear}...`);
    
    try {
      // Execute updates sequentially to avoid overwhelming the database
      for (const { id, updateData } of updatesNeeded) {
        const { error } = await supabase
          .from('tasks')
          .update(updateData)
          .eq('id', id);
        
        if (error) {
          console.error(`Failed to update task ${id}:`, error);
          throw error;
        }
      }
      
      console.log('Migration complete');
      return updatesNeeded.length;
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }
  
  return 0;
};

export const MigrationButton = ({ tasks }: { tasks: Task[] }) => {
  const { toast } = useToast();
  
  const handleMigration = async () => {
    try {
      const migratedCount = await migrateTaskDatesToCurrentYear(tasks);
      if (migratedCount > 0) {
        toast({
          title: "Migration Complete",
          description: `Successfully updated ${migratedCount} task(s) to 2025`,
        });
      } else {
        toast({
          title: "No Updates Needed",
          description: "All tasks are already using current year dates",
        });
      }
    } catch (error) {
      toast({
        title: "Migration Failed",
        description: "There was an error updating the task dates. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      onClick={handleMigration}
      className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors sm:px-3 sm:py-2 sm:text-sm"
    >
      Fix 2024 Task Dates
    </button>
  );
};
