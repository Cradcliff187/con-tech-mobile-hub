
import { useState, useMemo } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { PunchListView } from './PunchListView';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { canConvertToPunchList, shouldShowPunchList } from '@/utils/project-lifecycle';
import { useToast } from '@/components/ui/use-toast';
import { useProjects } from '@/hooks/useProjects';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const TaskManager = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { tasks, loading, updateTask } = useTasks();
  const { projects } = useProjects();
  const { toast } = useToast();

  const regularTasks = tasks.filter(task => (task.task_type || 'regular') !== 'punch_list');
  const filteredTasks = regularTasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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

  const handleConvertToPunchList = async () => {
    const tasksToConvert = regularTasks.filter(canConvertToPunchList);

    if (tasksToConvert.length === 0) {
      toast({
        title: "No tasks to convert",
        description: "There are no regular tasks with over 80% progress to convert.",
      });
      return;
    }

    const promises = tasksToConvert.map(task => 
      updateTask(task.id, {
        task_type: 'punch_list',
        converted_from_task_id: task.id,
        inspection_status: 'pending'
      })
    );

    try {
      await Promise.all(promises);
      toast({
        title: "Success",
        description: `${tasksToConvert.length} tasks converted to punch list items.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert tasks.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="h-20 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
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
            onClick={handleConvertToPunchList}
            variant="outline"
            size="sm"
          >
            Convert Ready to Punch List
          </Button>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
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
          <TaskList tasks={filteredTasks} />
        </TabsContent>

        <TabsContent value="punch-list">
          <PunchListView />
        </TabsContent>
      </Tabs>
      
      <CreateTaskDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};
