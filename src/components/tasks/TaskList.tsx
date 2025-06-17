
import { TaskItem } from './TaskItem';
import { Task } from '@/types/database';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
}

export const TaskList = ({ tasks, onEdit, onViewDetails }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No tasks found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onEdit={onEdit} 
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
