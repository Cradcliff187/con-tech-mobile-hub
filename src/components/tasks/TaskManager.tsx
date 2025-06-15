
import { useState } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { PunchListView } from './PunchListView';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { CreateTaskDialog } from './CreateTaskDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TaskManager = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { tasks, loading } = useTasks();

  const regularTasks = tasks.filter(task => task.task_type !== 'punch_list');
  const filteredTasks = regularTasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
        >
          <Plus size={20} />
          New Task
        </Button>
      </div>

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
