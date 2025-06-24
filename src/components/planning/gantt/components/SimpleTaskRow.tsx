
import React from 'react';
import { Task } from '@/types/database';
import { SimpleTaskCard } from './SimpleTaskCard';
import { SimpleTaskBar } from './SimpleTaskBar';

interface SimpleTaskRowProps {
  task: Task;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  isFirstRow?: boolean;
  timelineOnly?: boolean;
}

export const SimpleTaskRow = ({
  task,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  viewMode,
  timelineStart,
  timelineEnd,
  isFirstRow = false,
  timelineOnly = false
}: SimpleTaskRowProps) => {
  const isSelected = selectedTaskId === task.id;

  if (timelineOnly) {
    return (
      <SimpleTaskBar
        task={task}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        isSelected={isSelected}
        onUpdate={onTaskUpdate}
      />
    );
  }

  return (
    <div className={`flex border-b border-slate-200 hover:bg-slate-50 transition-colors ${isFirstRow ? 'border-t' : ''}`}>
      {/* Task Card */}
      <div className="w-full">
        <SimpleTaskCard
          task={task}
          isSelected={isSelected}
          onSelect={onTaskSelect}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};
