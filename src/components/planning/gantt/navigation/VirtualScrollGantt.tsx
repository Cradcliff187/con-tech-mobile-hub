
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
  headerScrollRef?: React.RefObject<HTMLDivElement>;
  isCollapsed?: boolean;
}

const EXPANDED_HEIGHT = 60; // Height when expanded
const COLLAPSED_HEIGHT = 30; // Height when collapsed
const BUFFER_SIZE = 5; // Number of items to render outside visible area

export const VirtualScrollGantt = ({
  tasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  containerHeight = 400,
  itemHeight,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  headerScrollRef,
  isCollapsed = false
}: VirtualScrollGanttProps) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  // Use dynamic height based on collapse state
  const currentItemHeight = itemHeight || (isCollapsed ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT);
  
  const totalHeight = tasks.length * currentItemHeight;
  const visibleItemCount = Math.ceil(containerHeight / currentItemHeight);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / currentItemHeight) - BUFFER_SIZE);
  const endIndex = Math.min(tasks.length - 1, startIndex + visibleItemCount + BUFFER_SIZE * 2);
  
  const visibleTasks = useMemo(() => {
    return tasks.slice(startIndex, endIndex + 1);
  }, [tasks, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
  };

  // Sync horizontal scroll with header
  useEffect(() => {
    const timelineScroll = timelineScrollRef.current;
    const headerScroll = headerScrollRef?.current;

    if (!timelineScroll || !headerScroll) return;

    const syncScrollLeft = (source: HTMLElement, target: HTMLElement) => {
      target.scrollLeft = source.scrollLeft;
    };

    const handleTimelineScroll = () => syncScrollLeft(timelineScroll, headerScroll);
    const handleHeaderScroll = () => syncScrollLeft(headerScroll, timelineScroll);

    timelineScroll.addEventListener('scroll', handleTimelineScroll, { passive: true });
    headerScroll.addEventListener('scroll', handleHeaderScroll, { passive: true });

    return () => {
      timelineScroll.removeEventListener('scroll', handleTimelineScroll);
      headerScroll.removeEventListener('scroll', handleHeaderScroll);
    };
  }, [headerScrollRef]);

  useEffect(() => {
    // Auto-scroll to selected task
    if (selectedTaskId && scrollElementRef.current) {
      const taskIndex = tasks.findIndex(task => task.id === selectedTaskId);
      if (taskIndex !== -1) {
        const targetScrollTop = taskIndex * currentItemHeight - containerHeight / 2;
        scrollElementRef.current.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedTaskId, tasks, currentItemHeight, containerHeight]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div 
        ref={scrollElementRef}
        className="overflow-y-auto"
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Master timeline scroll container for virtual scroll */}
          <div 
            ref={timelineScrollRef}
            className="absolute top-0 left-0 right-0 overflow-x-auto scrollbar-none md:scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 touch-pan-x"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin'
            }}
          >
            <div className="min-w-max">
              {visibleTasks.map((task, index) => {
                const taskIndex = startIndex + index;
                const top = taskIndex * currentItemHeight;
                
                return (
                  <div
                    key={task.id}
                    className="absolute left-0 right-0 flex border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                    style={{
                      top,
                      height: currentItemHeight
                    }}
                  >
                    {/* Task Card */}
                    <div className="w-80 lg:w-96 border-r border-slate-200 flex-shrink-0">
                      <GanttTaskCard
                        task={task}
                        isSelected={selectedTaskId === task.id}
                        onSelect={onTaskSelect}
                        viewMode={viewMode}
                        isCollapsed={isCollapsed}
                      />
                    </div>

                    {/* Timeline Area - No individual scrolling */}
                    <div className="flex-1 relative overflow-hidden">
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
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual scroll indicators */}
      {tasks.length > visibleItemCount && (
        <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-t text-xs text-slate-500">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex + 1, tasks.length)} of {tasks.length} tasks
            {isCollapsed && <span className="ml-2 text-blue-600">(Collapsed View)</span>}
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
