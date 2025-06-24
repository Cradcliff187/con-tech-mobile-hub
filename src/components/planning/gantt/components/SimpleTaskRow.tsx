
import React from 'react';
import { Task } from '@/types/database';
import { SimpleTaskCard } from './SimpleTaskCard';
import { SimpleTaskBar } from './SimpleTaskBar';

interface SimpleTaskRowProps {
  task: Task;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  isSelected: boolean;
  onSelect: (taskId: string | null) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  isFirstRow?: boolean;
}

export const SimpleTaskRow = ({
  task,
  timelineStart,
  timelineEnd,
  viewMode,
  isSelected,
  onSelect,
  onUpdate,
  isFirstRow = false
}: SimpleTaskRowProps) => {
  const handleClick = () => {
    onSelect(isSelected ? null : task.id);
  };

  return (
    <div className={`flex border-b border-slate-200 hover:bg-slate-50 ${isFirstRow ? 'border-t' : ''}`}>
      {/* Task Card - Fixed Column */}
      <div className="w-72 border-r border-slate-200 flex-shrink-0 bg-white">
        <SimpleTaskCard
          task={task}
          isSelected={isSelected}
          onClick={handleClick}
        />
      </div>

      {/* Task Bar - Scrollable Timeline */}
      <div className="flex-1 relative">
        <SimpleTaskBar
          task={task}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          isSelected={isSelected}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};
