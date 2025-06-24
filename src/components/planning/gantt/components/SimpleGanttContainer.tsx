
import React, { useRef, useState } from 'react';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { GanttTimelineHeader } from '../GanttTimelineHeader';
import { SimpleTaskRow } from './SimpleTaskRow';
import { useScrollSync } from '../hooks/useScrollSync';

interface SimpleGanttContainerProps {
  projectId: string;
  viewMode: 'days' | 'weeks' | 'months';
}

export const SimpleGanttContainer = ({ projectId, viewMode }: SimpleGanttContainerProps) => {
  const { tasks, loading, error, updateTask } = useTasks({ projectId });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const { headerScrollRef, contentScrollRef } = useScrollSync();

  if (loading) {
    return <div className="p-8 text-center">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">Error loading tasks: {error}</div>;
  }

  if (!tasks || tasks.length === 0) {
    return <div className="p-8 text-center text-slate-500">No tasks found for this project.</div>;
  }

  // Calculate timeline bounds from tasks
  const taskDates = tasks
    .flatMap(task => [task.start_date, task.due_date])
    .filter(Boolean)
    .map(date => new Date(date!));

  if (taskDates.length === 0) {
    return <div className="p-8 text-center text-slate-500">No task dates available.</div>;
  }

  const timelineStart = new Date(Math.min(...taskDates.map(d => d.getTime())));
  const timelineEnd = new Date(Math.max(...taskDates.map(d => d.getTime())));

  // Add padding
  timelineStart.setDate(timelineStart.getDate() - 7);
  timelineEnd.setDate(timelineEnd.getDate() + 7);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <GanttTimelineHeader
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        scrollRef={headerScrollRef}
      />

      {/* Content */}
      <div 
        ref={contentScrollRef}
        className="max-h-96 overflow-auto"
      >
        {tasks.map((task, index) => (
          <SimpleTaskRow
            key={task.id}
            task={task}
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
            viewMode={viewMode}
            isSelected={selectedTaskId === task.id}
            onSelect={setSelectedTaskId}
            onUpdate={handleTaskUpdate}
            isFirstRow={index === 0}
          />
        ))}
      </div>
    </div>
  );
};
