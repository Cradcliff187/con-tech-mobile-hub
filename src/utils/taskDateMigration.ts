
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/database';

export const migrateTaskDatesToCurrentYear = async (tasks: Task[]) => {
  const currentYear = 2025;
  const updates: Promise<any>[] = [];
  
  tasks.forEach(task => {
    const needsUpdate = 
      (task.start_date && new Date(task.start_date).getFullYear() < currentYear) ||
      (task.due_date && new Date(task.due_date).getFullYear() < currentYear);
    
    if (needsUpdate) {
      const updateData: any = {};
      
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
      
      updates.push(
        supabase
          .from('tasks')
          .update(updateData)
          .eq('id', task.id)
      );
    }
  });
  
  if (updates.length > 0) {
    console.log(`Migrating ${updates.length} tasks to ${currentYear}...`);
    const results = await Promise.all(updates);
    console.log('Migration complete:', results);
  }
  
  return updates.length;
};

export const MigrationButton = ({ tasks }: { tasks: Task[] }) => (
  <button
    onClick={() => migrateTaskDatesToCurrentYear(tasks)}
    className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
  >
    Fix 2024 Task Dates
  </button>
);
