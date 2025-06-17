
import { Task } from '@/types/database';

interface TaskBarContentProps {
  task: Task;
  actualWidth: number;
  viewModeConfig: {
    textLength: number;
    fontSize: string;
    showText: boolean;
  };
}

export const TaskBarContent = ({ task, actualWidth, viewModeConfig }: TaskBarContentProps) => {
  const getTaskDisplayText = () => {
    return task.title.slice(0, viewModeConfig.textLength) + 
           (task.title.length > viewModeConfig.textLength ? '...' : '');
  };

  return (
    <div className={`px-2 py-1 text-white ${viewModeConfig.fontSize} font-medium truncate`}>
      {actualWidth > 50 && viewModeConfig.showText ? getTaskDisplayText() : ''}
    </div>
  );
};
