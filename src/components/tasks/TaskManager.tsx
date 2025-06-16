
import React, { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { PunchListView } from './PunchListView';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from './CreateTaskDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { BulkTaskActionsDialog } from './BulkTaskActionsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { canConvertToPunchList, shouldShowPunchList } from '@/utils/project-lifecycle';
import { useToast } from '@/hooks/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Task } from '@/types/database';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const TaskManagerContent = memo(() => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const { tasks, loading, updateTask } = useTasks();
  const { projects } = useProjects();
  const { toast } = useToast();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const convertOperation = useAsyncOperation({
    successMessage: "",
    errorMessage: "Failed to convert tasks"
  });

  const regularTasks = useMemo(() => 
    tasks.filter(task => (task.task_type || 'regular') !== 'punch_list'),
    [tasks]
  );

  const filteredTasks = useMemo(() => 
    regularTasks.filter(task => {
      const matchesFilter = filter === 'all' || task.status === filter;
      const matchesSearch = task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           (task.description && task.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      return matchesFilter && matchesSearch;
    }),
    [regularTasks, filter, debouncedSearchTerm]
  );

  const selectedProjectId = useMemo(() => {
    if (filteredTasks.length > 0) {
      const firstProjectId = filteredTasks[0].project_id;
      if (filteredTasks.every(t => t.project_id === firstProjectId)) {
        return firstProjectId;
      }
    }
    return null;
  }, [filteredTasks]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  useEffect(() => {
    const handleOpenBulkActions = () => {
      setShowBulkActionsDialog(true);
    };

    window.addEventListener('openBulkActions', handleOpenBulkActions);
    return () => window.removeEventListener('openBulkActions', handleOpenBulkActions);
  }, []);

  const handleConvertToPunchList = useCallback(async () => {
    const tasksToConvert = regularTasks.filter(canConvertToPunchList);

    if (tasksToConvert.length === 0) {
      toast({
        title: "No tasks to convert",
        description: "There are no regular tasks with over 80% progress to convert.",
      });
      return;
    }

    await convertOperation.execute(async () => {
      const promises = tasksToConvert.map(task => 
        updateTask(task.id, {
          task_type: 'punch_list',
          converted_from_task_id: task.id,
          inspection_status: 'pending'
        })
      );
      
      await Promise.all(promises);
      
      toast({
        title: "Success",
        description: `${tasksToConvert.length} tasks converted to punch list items.`,
      });
    });
  }, [regularTasks, updateTask, convertOperation, toast]);

  const handleEditTask = useCallback((task: Task) => {
    setSelectedTaskForEdit(task);
    setShowEditDialog(true);
  }, []);

  const handleCreateClick = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const handleBulkActionsClick = useCallback(() => {
    setShowBulkActionsDialog(true);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-slate-600">Loading tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Task Management</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleBulkActionsClick}
            variant="outline"
            size="sm"
            className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
          >
            Bulk Actions
          </Button>
          <Button
            onClick={handleConvertToPunchList}
            variant="outline"
            size="sm"
            disabled={convertOperation.loading}
            className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
          >
            {convertOperation.loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Converting...
              </>
            ) : (
              'Convert Ready to Punch List'
            )}
          </Button>
          <Button 
            onClick={handleCreateClick}
            className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 transition-colors duration-200 focus:ring-2 focus:ring-orange-300"
          >
            <Plus size={20} />
            New Task
          </Button>
        </div>
      </div>

      {selectedProject && shouldShowPunchList(selectedProject) && (
        <Alert>
          <AlertDescription>
            This project is in the <span className="font-semibold capitalize">{selectedProject.phase.replace('_', ' ')}</span> phase. 
            New tasks should likely be Punch List items.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">Regular Tasks</TabsTrigger>
          <TabsTrigger value="punch-list">Punch List</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-6">
          <TaskFilters 
            currentFilter={filter}
            onFilterChange={setFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            tasks={regularTasks}
          />
          <TaskList tasks={filteredTasks} onEdit={handleEditTask} />
        </TabsContent>

        <TabsContent value="punch-list">
          <PunchListView />
        </TabsContent>
      </Tabs>
      
      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
      
      <EditTaskDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog} 
        task={selectedTaskForEdit}
      />

      <BulkTaskActionsDialog
        open={showBulkActionsDialog}
        onOpenChange={setShowBulkActionsDialog}
        tasks={filteredTasks}
      />
    </div>
  );
});

TaskManagerContent.displayName = 'TaskManagerContent';

export const TaskManager = () => {
  return (
    <ErrorBoundary>
      <TaskManagerContent />
    </ErrorBoundary>
  );
};
