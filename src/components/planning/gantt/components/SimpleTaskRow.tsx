
import React, { memo } from 'react';
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

const SimpleTaskRowComponent = ({
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
          onClick={() => onTaskSelect(task.id)}
        />
      </div>
    </div>
  );
};

// Custom comparison function that checks only relevant props
const arePropsEqual = (prevProps: SimpleTaskRowProps, nextProps: SimpleTaskRowProps) => {
  // Task data comparison - check key properties that affect rendering
  const taskChanged = 
    prevProps.task.id !== nextProps.task.id ||
    prevProps.task.start_date !== nextProps.task.start_date ||
    prevProps.task.due_date !== nextProps.task.due_date ||
    prevProps.task.title !== nextProps.task.title ||
    prevProps.task.progress !== nextProps.task.progress ||
    prevProps.task.status !== nextProps.task.status ||
    prevProps.task.priority !== nextProps.task.priority ||
    prevProps.task.estimate_hours !== nextProps.task.estimate_hours;

  // UI state comparison
  const uiChanged = 
    prevProps.selectedTaskId !== nextProps.selectedTaskId ||
    prevProps.viewMode !== nextProps.viewMode ||
    prevProps.isFirstRow !== nextProps.isFirstRow ||
    prevProps.timelineOnly !== nextProps.timelineOnly;

  // Timeline comparison (compare by time value, not object reference)
  const timelineChanged = 
    prevProps.timelineStart.getTime() !== nextProps.timelineStart.getTime() ||
    prevProps.timelineEnd.getTime() !== nextProps.timelineEnd.getTime();

  // Return true if nothing changed (props are equal)
  return !taskChanged && !uiChanged && !timelineChanged;
};

export const SimpleTaskRow = memo(SimpleTaskRowComponent, arePropsEqual);
