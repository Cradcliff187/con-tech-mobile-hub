import { useState, useCallback } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/database';

interface CategoryStats {
  name: string;
  taskCount: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  averageProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
}

export const useCategoryManagement = (projectId: string) => {
  const { tasks, updateTask } = useTasks();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getProjectTasks = useCallback(() => {
    return tasks.filter(task => task.project_id === projectId);
  }, [tasks, projectId]);

  const getCategoryStats = useCallback((): CategoryStats[] => {
    const projectTasks = getProjectTasks();
    const categoryMap = new Map<string, Task[]>();

    // Group tasks by category
    projectTasks.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(task);
    });

    // Calculate stats for each category
    return Array.from(categoryMap.entries()).map(([name, tasks]) => {
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
      const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
      const averageProgress = tasks.length > 0 
        ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length)
        : 0;
      const totalEstimatedHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);
      const totalActualHours = tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0);

      return {
        name,
        taskCount: tasks.length,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        averageProgress,
        totalEstimatedHours,
        totalActualHours
      };
    });
  }, [getProjectTasks]);

  const renameCategory = useCallback(async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return { success: false, error: 'Invalid category name' };

    setIsLoading(true);
    const projectTasks = getProjectTasks();
    const tasksToUpdate = projectTasks.filter(task => 
      (task.category || 'Uncategorized') === oldName
    );

    try {
      const updatePromises = tasksToUpdate.map(task =>
        updateTask(task.id, { category: newName.trim() })
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => result.error);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to update ${failedUpdates.length} tasks`);
      }

      toast({
        title: "Category Renamed",
        description: `Renamed "${oldName}" to "${newName}" (${tasksToUpdate.length} tasks updated)`,
        variant: "default"
      });

      return { success: true };
    } catch (error) {
      console.error('Error renaming category:', error);
      toast({
        title: "Rename Failed",
        description: error instanceof Error ? error.message : "Failed to rename category",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [getProjectTasks, updateTask, toast]);

  const deleteCategory = useCallback(async (categoryName: string, reassignTo?: string) => {
    setIsLoading(true);
    const projectTasks = getProjectTasks();
    const tasksToUpdate = projectTasks.filter(task => 
      (task.category || 'Uncategorized') === categoryName
    );

    if (tasksToUpdate.length === 0) {
      toast({
        title: "Category Not Found",
        description: "No tasks found in this category",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false, error: 'Category not found' };
    }

    try {
      let updatePromises;

      if (reassignTo) {
        // Reassign tasks to another category
        updatePromises = tasksToUpdate.map(task =>
          updateTask(task.id, { category: reassignTo })
        );
      } else {
        // Delete tasks (soft delete by marking as blocked with [DELETED] prefix)
        updatePromises = tasksToUpdate.map(task =>
          updateTask(task.id, { 
            status: 'blocked',
            description: `[DELETED] ${task.description || ''}`,
            category: null
          })
        );
      }

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => result.error);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to ${reassignTo ? 'reassign' : 'delete'} ${failedUpdates.length} tasks`);
      }

      toast({
        title: "Category Deleted",
        description: reassignTo 
          ? `Moved ${tasksToUpdate.length} tasks to "${reassignTo}"`
          : `Deleted category and ${tasksToUpdate.length} tasks`,
        variant: "default"
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [getProjectTasks, updateTask, toast]);

  const mergeCategories = useCallback(async (sourceCategories: string[], targetCategory: string) => {
    setIsLoading(true);
    const projectTasks = getProjectTasks();
    const tasksToUpdate = projectTasks.filter(task => {
      const taskCategory = task.category || 'Uncategorized';
      return sourceCategories.includes(taskCategory);
    });

    if (tasksToUpdate.length === 0) {
      toast({
        title: "No Tasks Found",
        description: "No tasks found in the selected categories",
        variant: "destructive"
      });
      setIsLoading(false);
      return { success: false, error: 'No tasks found' };
    }

    try {
      const updatePromises = tasksToUpdate.map(task =>
        updateTask(task.id, { category: targetCategory })
      );

      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(result => result.error);

      if (failedUpdates.length > 0) {
        throw new Error(`Failed to merge ${failedUpdates.length} tasks`);
      }

      toast({
        title: "Categories Merged",
        description: `Merged ${sourceCategories.length} categories into "${targetCategory}" (${tasksToUpdate.length} tasks moved)`,
        variant: "default"
      });

      return { success: true };
    } catch (error) {
      console.error('Error merging categories:', error);
      toast({
        title: "Merge Failed",
        description: error instanceof Error ? error.message : "Failed to merge categories",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, [getProjectTasks, updateTask, toast]);

  const getCategories = useCallback(() => {
    const projectTasks = getProjectTasks();
    const categories = new Set<string>();
    
    projectTasks.forEach(task => {
      categories.add(task.category || 'Uncategorized');
    });

    return Array.from(categories).sort();
  }, [getProjectTasks]);

  return {
    isLoading,
    getCategoryStats,
    renameCategory,
    deleteCategory,
    mergeCategories,
    getCategories
  };
};