
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { Task } from '@/types/database';

interface TaskViewProgressProps {
  task: Task;
}

export const TaskViewProgress: React.FC<TaskViewProgressProps> = ({ task }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Target className="h-4 w-4 text-slate-500" />
        <label className="text-sm font-medium text-slate-700">Progress</label>
        <span className="text-sm text-slate-500 ml-auto">{task.progress || 0}%</span>
      </div>
      <Progress 
        value={task.progress || 0} 
        className="h-2 bg-slate-100"
      />
    </div>
  );
};
