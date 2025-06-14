
import { Calendar, User, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  project: string;
  category: string;
}

interface TaskItemProps {
  task: Task;
}

export const TaskItem = ({ task }: TaskItemProps) => {
  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: <Clock size={16} className="text-slate-500" />,
    'in-progress': <AlertTriangle size={16} className="text-orange-500" />,
    completed: <CheckCircle size={16} className="text-green-500" />
  };

  const statusColors = {
    pending: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700'
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-slate-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-slate-800 mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-slate-600 mb-2">
            {task.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <User size={14} />
              {task.assignee}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(task.dueDate)}
              {isOverdue && <span className="text-red-600 font-medium ml-1">(Overdue)</span>}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[task.status]}`}>
              {statusIcons[task.status]}
              {task.status.replace('-', ' ')}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {task.project}
        </span>
        <div className="flex gap-2">
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Edit
          </button>
          <button className="text-xs text-slate-500 hover:text-slate-600 font-medium">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
