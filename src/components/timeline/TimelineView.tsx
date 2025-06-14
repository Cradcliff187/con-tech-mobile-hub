
interface Task {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: number[];
  assignee: string;
}

interface Project {
  id: number;
  name: string;
  tasks: Task[];
}

interface TimelineViewProps {
  project: Project;
  onTaskSelect: (task: Task) => void;
  selectedTask: Task | null;
}

export const TimelineView = ({ project, onTaskSelect, selectedTask }: TimelineViewProps) => {
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-orange-500';
    if (progress > 0) return 'bg-blue-500';
    return 'bg-slate-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysFromStart = (startDate: string, projectStart: string) => {
    const start = new Date(projectStart);
    const current = new Date(startDate);
    return Math.max(0, Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const projectStartDate = project.tasks[0]?.startDate || '2024-06-01';
  const totalDays = 90; // Approximate project duration

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Gantt Chart View</h3>
      
      <div className="space-y-4">
        {project.tasks.map((task) => {
          const startOffset = getDaysFromStart(task.startDate, projectStartDate);
          const duration = getDuration(task.startDate, task.endDate);
          const widthPercent = (duration / totalDays) * 100;
          const leftPercent = (startOffset / totalDays) * 100;
          
          const isSelected = selectedTask?.id === task.id;
          
          return (
            <div key={task.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors ${
                    isSelected ? 'text-blue-600' : 'text-slate-800'
                  }`}
                    onClick={() => onTaskSelect(task)}
                  >
                    {task.name}
                  </h4>
                  <p className="text-xs text-slate-500">{task.assignee}</p>
                </div>
                <div className="text-xs text-slate-500 ml-4">
                  {formatDate(task.startDate)} - {formatDate(task.endDate)}
                </div>
              </div>
              
              <div className="relative h-8 bg-slate-100 rounded">
                <div
                  className={`absolute top-1 h-6 rounded cursor-pointer transition-all duration-200 ${
                    getProgressColor(task.progress)
                  } ${isSelected ? 'ring-2 ring-blue-300' : ''}`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                  onClick={() => onTaskSelect(task)}
                >
                  <div className="flex items-center justify-center h-full text-white text-xs font-medium">
                    {task.progress}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Started</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded"></div>
            <span>Not Started</span>
          </div>
        </div>
      </div>
    </div>
  );
};
