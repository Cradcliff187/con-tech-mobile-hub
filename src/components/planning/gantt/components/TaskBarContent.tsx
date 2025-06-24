
import React from 'react';
import { Task } from '@/types/database';
import { ViewModeConfig } from '../utils/viewModeUtils';

interface TaskBarContentProps {
  task: Task;
  actualWidth: number;
  viewModeConfig: ViewModeConfig;
}

export const TaskBarContent = ({ task, actualWidth, viewModeConfig }: TaskBarContentProps) => {
  const minWidthForText = 48; // Minimum width to show text
  const showText = actualWidth >= minWidthForText;

  if (!showText) {
    return null;
  }

  return (
    <div className={`px-2 py-1 h-full flex items-center justify-center ${viewModeConfig.fontSize}`}>
      <span className="truncate font-medium">
        {task.title}
      </span>
    </div>
  );
};
