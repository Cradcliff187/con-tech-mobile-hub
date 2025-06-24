
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
  const [timelineStart, setTimelineStart] = useState<Date | null>(null);
  const [timelineEnd, setTimelineEnd] = useState<Date | null>(null);
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

  // Calculate timeline bounds from tasks or use state values
  let calculatedTimelineStart = timelineStart;
  let calculatedTimelineEnd = timelineEnd;

  if (!calculatedTimelineStart || !calculatedTimelineEnd) {
    const taskDates = tasks
      .flatMap(task => [task.start_date, task.due_date])
      .filter(Boolean)
      .map(date => new Date(date!));

    if (taskDates.length === 0) {
      return <div className="p-8 text-center text-slate-500">No task dates available.</div>;
    }

    calculatedTimelineStart = new Date(Math.min(...taskDates.map(d => d.getTime())));
    calculatedTimelineEnd = new Date(Math.max(...taskDates.map(d => d.getTime())));

    // Add padding
    calculatedTimelineStart.setDate(calculatedTimelineStart.getDate() - 7);
    calculatedTimelineEnd.setDate(calculatedTimelineEnd.getDate() + 7);
  }

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTimelineBoundsChange = (start: Date, end: Date) => {
    setTimelineStart(start);
    setTimelineEnd(end);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <GanttTimelineHeader
        timelineStart={calculatedTimelineStart}
        timelineEnd={calculatedTimelineEnd}
        viewMode={viewMode}
        tasks={tasks}
        scrollRef={headerScrollRef}
        onTimelineBoundsChange={handleTimelineBoundsChange}
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
            timelineStart={calculatedTimelineStart}
            timelineEnd={calculatedTimelineEnd}
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
