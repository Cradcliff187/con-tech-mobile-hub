
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { AddCategoryDialog } from './AddCategoryDialog';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { useToast } from '@/hooks/use-toast';
import { useTaskHierarchyActions } from '@/hooks/useTaskHierarchyActions';
import { TaskHierarchyRow } from './TaskHierarchyRow';
import { TaskHierarchySummary } from './TaskHierarchySummary';
import { TaskHierarchyEmptyState } from './TaskHierarchyEmptyState';
import { TaskHierarchyHeader } from './TaskHierarchyHeader';

interface TaskHierarchyProps {
  projectId: string;
}

interface HierarchyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assignee?: string;
  category?: string;
  children: HierarchyTask[];
  expanded?: boolean;
}

export const TaskHierarchy = ({ projectId }: TaskHierarchyProps) => {
  const { tasks, updateTask } = useTasks();
  const [hierarchyTasks, setHierarchyTasks] = useState<HierarchyTask[]>([]);
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { toast } = useToast();

  // Task editing actions
  const {
    editingTask,
    viewingTask,
    isEditDialogOpen,
    isViewDialogOpen,
    handleEditTask,
    handleViewTask,
    handleDuplicateTask,
    handleDeleteTask,
    closeEditDialog,
    closeViewDialog
  } = useTaskHierarchyActions({ projectId });

  useEffect(() => {
    // Filter and organize tasks into hierarchy
    const projectTasks = tasks.filter(task => 
      task.project_id === projectId
      // Remove the cancelled status filter since it's not valid
    );
    
    // Group by category for basic hierarchy
    const categories = new Set(projectTasks.map(task => task.category || 'Uncategorized'));
    
    const hierarchy: HierarchyTask[] = Array.from(categories).map(category => ({
      id: `category-${category}`,
      title: category,
      status: 'category',
      priority: 'medium',
      progress: 0,
      category,
      children: projectTasks
        .filter(task => (task.category || 'Uncategorized') === category)
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          progress: task.progress || 0,
          dueDate: task.due_date,
          assignee: task.assignee_id,
          category: task.category,
          children: []
        })),
      expanded: true
    }));

    // Calculate category progress
    hierarchy.forEach(category => {
      if (category.children.length > 0) {
        category.progress = Math.round(
          category.children.reduce((sum, child) => sum + child.progress, 0) / category.children.length
        );
      }
    });

    setHierarchyTasks(hierarchy);
  }, [tasks, projectId]);

  const toggleExpanded = (taskId: string) => {
    setHierarchyTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, expanded: !task.expanded }
          : task
      )
    );
  };

  const handleAddTask = (category?: string) => {
    setSelectedCategory(category);
    openDialog('details');
  };

  const handleAddCategory = () => {
    openDialog('edit');
  };

  const handleStatusChange = async (taskId: string, newStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    try {
      const result = await updateTask(taskId, { status: newStatus });
      if (result.error) {
        throw new Error(result.error);
      }
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  if (hierarchyTasks.length === 0) {
    return (
      <>
        <TaskHierarchyEmptyState onAddCategory={handleAddCategory} />
        <AddCategoryDialog
          open={isDialogOpen('edit')}
          onOpenChange={(open) => !open && closeDialog()}
          projectId={projectId}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <TaskHierarchyHeader onAddCategory={handleAddCategory} />

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-4" />
            <span className="flex-1 text-sm font-medium text-slate-700">Task</span>
            <span className="w-20 text-sm font-medium text-slate-700 text-center">Progress</span>
            <span className="w-20 text-sm font-medium text-slate-700 text-center">Assignee</span>
            <div className="w-16 text-sm font-medium text-slate-700 text-center">Actions</div>
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {hierarchyTasks.map(task => (
            <TaskHierarchyRow 
              key={task.id} 
              task={task}
              onToggleExpanded={toggleExpanded}
              onStatusChange={handleStatusChange}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
              onDuplicateTask={handleDuplicateTask}
              onDeleteTask={handleDeleteTask}
              canEdit={true}
            />
          ))}
        </div>
      </div>

      <TaskHierarchySummary hierarchyTasks={hierarchyTasks} />

      {/* Dialogs */}
      <AddCategoryDialog
        open={isDialogOpen('edit')}
        onOpenChange={(open) => !open && closeDialog()}
        projectId={projectId}
      />
      
      <AddTaskDialog
        open={isDialogOpen('details')}
        onOpenChange={(open) => !open && closeDialog()}
        projectId={projectId}
        category={selectedCategory}
      />

      {/* Task Edit Dialog */}
      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={closeEditDialog}
        task={editingTask}
        mode="edit"
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={closeViewDialog}
        task={viewingTask}
        onEditRequest={(task) => {
          closeViewDialog();
          handleEditTask(task.id);
        }}
      />
    </div>
  );
};
