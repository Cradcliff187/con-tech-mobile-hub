
import { Calendar, User, Clock, CheckSquare } from 'lucide-react';

interface Task {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: number[];
  assignee: string;
}

interface TaskDetailsProps {
  task: Task | null;
}

export const TaskDetails = ({ task }: TaskDetailsProps) => {
  if (!task) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="text-center text-slate-500 py-8">
          <CheckSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a task to view details</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Task Details</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Task Name</h4>
          <p className="text-slate-800 font-medium">{task.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Progress</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-800">{task.progress}%</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-600 mb-2">Duration</h4>
            <div className="flex items-center gap-2 text-slate-800">
              <Clock size={16} />
              <span>{getDuration(task.startDate, task.endDate)} days</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Schedule</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <Calendar size={16} />
              <span>Start: {formatDate(task.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-800">
              <Calendar size={16} />
              <span>End: {formatDate(task.endDate)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Assigned To</h4>
          <div className="flex items-center gap-2 text-slate-800">
            <User size={16} />
            <span>{task.assignee}</span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-2">Dependencies</h4>
          {task.dependencies.length > 0 ? (
            <div className="text-sm text-slate-800">
              Depends on Task {task.dependencies.join(', Task ')}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No dependencies</div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Update Progress
          </button>
        </div>
      </div>
    </div>
  );
};
