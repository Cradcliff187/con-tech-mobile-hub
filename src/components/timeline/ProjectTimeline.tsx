
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useState } from 'react';
import { Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ProjectTimeline = () => {
  const { projects } = useProjects();
  const { tasks, loading } = useTasks();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const filteredTasks = selectedProjectId 
    ? tasks.filter(task => task.project_id === selectedProjectId)
    : tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'in-progress':
        return <Clock className="text-orange-500" size={20} />;
      case 'blocked':
        return <AlertTriangle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-slate-400" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Project Timeline</h3>
        
        {projects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Tasks Found</h3>
          <p className="text-slate-500">
            {selectedProjectId ? 'No tasks found for the selected project.' : 'Create tasks to see the project timeline.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              
              <div className="space-y-6">
                {sortedTasks.map((task, index) => (
                  <div key={task.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="absolute left-4 top-2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full z-10"></div>
                    
                    {/* Task content */}
                    <div className="ml-12 flex-1">
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium text-slate-800">{task.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {task.due_date 
                              ? `Due: ${new Date(task.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}`
                              : 'No due date'
                            }
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
