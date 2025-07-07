import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Task } from '@/types/database';
import { SimpleTaskRow } from './SimpleTaskRow';

interface VirtualizedTaskListProps {
  displayTasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  viewMode: 'days' | 'weeks' | 'months';
  timelineStart: Date;
  timelineEnd: Date;
  collapsedTasks: Set<string>;
  onToggleCollapse: (taskId: string) => void;
  height: number;
}

const ITEM_HEIGHT = 64; // Height per task row
const BUFFER_SIZE = 5; // Number of items to render outside visible area

const VirtualizedTaskListComponent = ({
  displayTasks,
  selectedTaskId,
  onTaskSelect,
  onTaskUpdate,
  viewMode,
  timelineStart,
  timelineEnd,
  collapsedTasks,
  onToggleCollapse,
  height
}: VirtualizedTaskListProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const itemsInView = Math.ceil(height / ITEM_HEIGHT);
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      displayTasks.length - 1,
      startIndex + itemsInView + BUFFER_SIZE * 2
    );
    const totalHeight = displayTasks.length * ITEM_HEIGHT;

    return { startIndex, endIndex, totalHeight };
  }, [scrollTop, height, displayTasks.length]);

  // Get visible items
  const visibleTasks = useMemo(() => {
    return displayTasks.slice(startIndex, endIndex + 1);
  }, [displayTasks, startIndex, endIndex]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (scrollElementRef.current) {
        setScrollTop(scrollElementRef.current.scrollTop);
      }
    };

    const scrollElement = scrollElementRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="w-64 lg:w-72 flex-shrink-0 border-r border-slate-200 bg-white">
      <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-3">
        <span className="text-sm font-medium text-slate-700">
          Tasks ({displayTasks.length})
        </span>
      </div>
      
      <div
        ref={scrollElementRef}
        className="overflow-y-auto overflow-x-hidden flex-1"
        style={{ height: height - 32 }} // Account for header
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${startIndex * ITEM_HEIGHT}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleTasks.map((task, index) => {
              const actualIndex = startIndex + index;
              return (
                <div
                  key={task.id}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                  style={{ height: ITEM_HEIGHT }}
                >
                  <SimpleTaskRow
                    task={task}
                    selectedTaskId={selectedTaskId}
                    onTaskSelect={onTaskSelect}
                    onTaskUpdate={onTaskUpdate}
                    viewMode={viewMode}
                    timelineStart={timelineStart}
                    timelineEnd={timelineEnd}
                    isFirstRow={actualIndex === 0}
                    timelineOnly={false}
                    isCollapsed={collapsedTasks.has(task.id)}
                    onToggleCollapse={onToggleCollapse}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoized component for performance
export const VirtualizedTaskList = memo(VirtualizedTaskListComponent, (prevProps, nextProps) => {
  return (
    prevProps.displayTasks.length === nextProps.displayTasks.length &&
    prevProps.selectedTaskId === nextProps.selectedTaskId &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.timelineStart.getTime() === nextProps.timelineStart.getTime() &&
    prevProps.timelineEnd.getTime() === nextProps.timelineEnd.getTime() &&
    prevProps.collapsedTasks.size === nextProps.collapsedTasks.size &&
    prevProps.height === nextProps.height
  );
});