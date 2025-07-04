
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { AddCategoryDialog } from './AddCategoryDialog';
import { AddTaskDialog } from './AddTaskDialog';
import { EditTaskDialog } from '@/components/tasks/EditTaskDialog';
import { TaskDetailsDialog } from '@/components/tasks/TaskDetailsDialog';
import { CategoryManagementDialog } from './CategoryManagementDialog';
import { useDialogState } from '@/hooks/useDialogState';
import { useToast } from '@/hooks/use-toast';
import { useTaskHierarchyActions } from '@/hooks/useTaskHierarchyActions';
import { useTaskHierarchyKeyboardShortcuts } from '@/hooks/useTaskHierarchyKeyboardShortcuts';
import { useTaskHierarchyUndo } from '@/hooks/useTaskHierarchyUndo';
import { useCategoryManagement } from '@/hooks/useCategoryManagement';
import { TaskHierarchyRow } from './TaskHierarchyRow';
import { TaskHierarchySummary } from './TaskHierarchySummary';
import { TaskHierarchyEmptyState } from './TaskHierarchyEmptyState';
import { TaskHierarchyHeader } from './TaskHierarchyHeader';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Undo2, Redo2, Settings, Keyboard } from 'lucide-react';

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();
  const [isUpdating, setIsUpdating] = useState(false);
  const { activeDialog, openDialog, closeDialog, isDialogOpen } = useDialogState();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { toast } = useToast();

  // Enhanced functionality hooks
  const { addUndoAction, undo, redo, canUndo, canRedo, isUndoing } = useTaskHierarchyUndo();
  const { isLoading: categoryLoading } = useCategoryManagement(projectId);

  const handleAddTask = (category?: string) => {
    setSelectedCategory(category);
    openDialog('details');
  };

  const handleAddCategory = () => {
    openDialog('edit');
  };

  // Task editing actions with undo support
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
  } = useTaskHierarchyActions({ projectId, addUndoAction });

  // Keyboard shortcuts
  useTaskHierarchyKeyboardShortcuts({
    onAddTask: () => handleAddTask(),
    onAddCategory: handleAddCategory,
    onUndo: undo,
    onRedo: redo,
    selectedTaskId,
    onEditTask: handleEditTask,
    onDuplicateTask: handleDuplicateTask,
    onDeleteTask: handleDeleteTask,
    disabled: isUpdating || categoryLoading || isUndoing
  });

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


  const handleStatusChange = async (taskId: string, newStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    setIsUpdating(true);

    try {
      const result = await updateTask(taskId, { status: newStatus });
      if (result.error) {
        throw new Error(result.error);
      }

      // Track undo action
      addUndoAction({
        type: 'update',
        description: `Changed status from ${oldStatus} to ${newStatus}`,
        data: {
          taskId,
          before: { status: oldStatus },
          after: { status: newStatus }
        }
      });

      toast({
        title: "Status Updated",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCategoryManagement = () => {
    openDialog('category-management');
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
      {/* Enhanced Header with Controls */}
      <div className="flex items-center justify-between">
        <TaskHierarchyHeader onAddCategory={handleAddCategory} />
        
        <div className="flex items-center gap-2">
          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo || isUndoing}
              title="Undo last action (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </Button>
            <Button
              variant="outline"  
              size="sm"
              onClick={redo}
              disabled={!canRedo || isUndoing}
              title="Redo last action (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </Button>
          </div>

          {/* Category Management */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCategoryManagement}
            disabled={categoryLoading}
            title="Manage categories"
          >
            <Settings size={16} />
            {categoryLoading && <LoadingSpinner size="sm" className="ml-2" />}
          </Button>
        </div>
      </div>

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
        <div className="max-h-96 overflow-y-auto relative">
          {(isUpdating || isUndoing) && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <LoadingSpinner />
            </div>
          )}
          {hierarchyTasks.map(task => (
            <TaskHierarchyRow 
              key={task.id} 
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={setSelectedTaskId}
              onToggleExpanded={toggleExpanded}
              onStatusChange={handleStatusChange}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onViewTask={handleViewTask}
              onDuplicateTask={handleDuplicateTask}
              onDeleteTask={handleDeleteTask}
              onCategoryRename={(oldName, newName) => {
                // Handle category rename from row
                const categoryMgmt = useCategoryManagement(projectId);
                categoryMgmt.renameCategory(oldName, newName);
              }}
              canEdit={!isUpdating}
              isUpdating={isUpdating}
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

      {/* Category Management Dialog */}
      <CategoryManagementDialog
        open={isDialogOpen('category-management')}
        onOpenChange={(open) => !open && closeDialog()}
        projectId={projectId}
      />
    </div>
  );
};
