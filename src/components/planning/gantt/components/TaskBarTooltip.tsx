
import React from 'react';
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateTaskDatesFromEstimate, formatDateRange } from '../utils/dateUtils';

interface TaskBarTooltipProps {
  task: Task;
  viewMode: 'days' | 'weeks' | 'months';
  children: React.ReactNode;
}

export const TaskBarTooltip = ({ task, viewMode, children }: TaskBarTooltipProps) => {
  const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
  const dateRange = formatDateRange(calculatedStartDate, calculatedEndDate);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <p className="text-sm text-muted-foreground">{dateRange}</p>
            <p className="text-sm">Status: {task.status}</p>
            <p className="text-sm">Priority: {task.priority}</p>
            {task.progress && <p className="text-sm">Progress: {task.progress}%</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
