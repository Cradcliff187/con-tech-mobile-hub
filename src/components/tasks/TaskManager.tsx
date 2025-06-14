import { useState } from 'react';
import { TaskList } from './TaskList';
import { TaskFilters } from './TaskFilters';
import { Plus } from 'lucide-react';

export const TaskManager = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const tasks = [
    {
      id: 1,
      title: 'Foundation Inspection',
      description: 'Schedule and complete foundation inspection with city inspector',
      priority: 'high' as const,
      status: 'pending' as const,
      assignee: 'Mike Johnson',
      dueDate: '2024-06-20',
      project: 'Downtown Office Complex',
      category: 'inspection'
    },
    {
      id: 2,
      title: 'Material Delivery Coordination',
      description: 'Coordinate steel beam delivery for structural work',
      priority: 'medium' as const,
      status: 'in-progress' as const,
      assignee: 'Sarah Wilson',
      dueDate: '2024-06-18',
      project: 'Downtown Office Complex',
      category: 'logistics'
    },
    {
      id: 3,
      title: 'Safety Equipment Check',
      description: 'Weekly safety equipment inspection and maintenance',
      priority: 'high' as const,
      status: 'completed' as const,
      assignee: 'Tom Rodriguez',
      dueDate: '2024-06-15',
      project: 'All Sites',
      category: 'safety'
    },
    {
      id: 4,
      title: 'Electrical Permit Application',
      description: 'Submit electrical permit application for Phase 2',
      priority: 'medium' as const,
      status: 'pending' as const,
      assignee: 'Lisa Chen',
      dueDate: '2024-06-22',
      project: 'Residential Housing Phase 2',
      category: 'permits'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-800">Task Management</h2>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus size={20} />
          New Task
        </button>
      </div>

      <TaskFilters 
        currentFilter={filter}
        onFilterChange={setFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <TaskList tasks={filteredTasks} />
    </div>
  );
};
