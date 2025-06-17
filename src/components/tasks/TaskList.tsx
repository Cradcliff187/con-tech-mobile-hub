
import React, { useEffect, useRef } from 'react';
import { TaskItem } from './TaskItem';
import { Task } from '@/types/database';

interface TaskListProps {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onViewDetails?: (task: Task) => void;
  selectedTaskId?: string | null;
}

export const TaskList = ({ tasks, onEdit, onViewDetails, selectedTaskId }: TaskListProps) => {
  const taskRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-scroll to selected task when selectedTaskId changes
  useEffect(() => {
    if (selectedTaskId && taskRefs.current[selectedTaskId]) {
      const element = taskRefs.current[selectedTaskId];
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [selectedTaskId]);

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
        <div
          key={task.id}
          ref={(el) => {
            taskRefs.current[task.id] = el;
          }}
        >
          <TaskItem 
            task={task} 
            onEdit={onEdit} 
            onViewDetails={onViewDetails}
            isSelected={selectedTaskId === task.id}
          />
        </div>
      ))}
    </div>
  );
};
