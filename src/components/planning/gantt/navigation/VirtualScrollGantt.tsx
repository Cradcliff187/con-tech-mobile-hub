
import { useState, useEffect, useRef, useMemo } from 'react';
import { Task } from '@/types/database';
import { GanttTaskCard } from '../GanttTaskCard';
import { GanttTimelineBar } from '../GanttTimelineBar';

interface VirtualScrollGanttProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  containerHeight?: number;
  itemHeight?: number;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  draggedTaskId?: string;
}

const ITEM_HEIGHT = 80; // Height of each task row
const BUFFER_SIZE = 5; // Number of items to render outside visible area

export const VirtualScrollGantt = ({
  tasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  containerHeight = 400,
  itemHeight = ITEM_HEIGHT,
  onDragStart,
  onDragEnd,
  draggedTaskId
}: VirtualScrollGanttProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const totalHeight = tasks.length * itemHeight;
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER_SIZE);
  const endIndex = Math.min(tasks.length - 1, startIndex + visibleItemCount + BUFFER_SIZE * 2);
  
  const visibleTasks = useMemo(() => {
    return tasks.slice(startIndex, endIndex + 1);
  }, [tasks, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  };

  // Sync horizontal scroll between task cards and timeline
  const handleTimelineScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (timelineScrollRef.current && scrollElementRef.current) {
      // Sync any other timeline scroll containers here
    }
  };

  useEffect(() => {
    // Auto-scroll to selected task
    if (selectedTaskId && scrollElementRef.current) {
      const taskIndex = tasks.findIndex(task => task.id === selectedTaskId);
      if (taskIndex !== -1) {
        const targetScrollTop = taskIndex * itemHeight - containerHeight / 2;
        scrollElementRef.current.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedTaskId, tasks, itemHeight, containerHeight]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div 
        ref={scrollElementRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleTasks.map((task, index) => {
            const taskIndex = startIndex + index;
            const top = taskIndex * itemHeight;
            
            return (
              <div
                key={task.id}
                className="absolute left-0 right-0 flex border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                style={{
                  top,
                  height: itemHeight
                }}
              >
                {/* Task Card */}
                <div className="w-80 lg:w-96 border-r border-slate-200">
                  <GanttTaskCard
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onTaskSelect}
                    viewMode={viewMode}
                  />
                </div>

                {/* Timeline Area */}
                <div className="flex-1 relative">
                  <div 
                    ref={index === 0 ? timelineScrollRef : undefined}
                    className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
                    onScroll={handleTimelineScroll}
                  >
                    <div className="min-w-max relative">
                      <GanttTimelineBar
                        task={task}
                        timelineStart={timelineStart}
                        timelineEnd={timelineEnd}
                        isSelected={selectedTaskId === task.id}
                        onSelect={onTaskSelect}
                        viewMode={viewMode}
                        isDragging={draggedTaskId === task.id}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual scroll indicators */}
      {tasks.length > visibleItemCount && (
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-t text-xs text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex + 1, tasks.length)} of {tasks.length} tasks
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-slate-200 rounded">
              <div 
                className="h-full bg-blue-500 rounded"
                style={{ 
                  width: `${((endIndex - startIndex + 1) / tasks.length) * 100}%`,
                  marginLeft: `${(startIndex / tasks.length) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
