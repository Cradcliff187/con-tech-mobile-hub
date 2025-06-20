
/* @__PURE__ */
import React, { useState, useEffect } from 'react';
import { Task } from '@/types/database';

interface PerformanceDebugPanelProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

interface ScrollPosition {
  x: number;
  y: number;
}

export const PerformanceDebugPanel: React.FC<PerformanceDebugPanelProps> = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode
}) => {
  const [renderCount, setRenderCount] = useState<number>(0);
  const [lastRenderTime, setLastRenderTime] = useState<number>(0);
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const startTime = performance.now();
    setRenderCount(prev => prev + 1);
    
    // Measure render time
    const endTime = performance.now();
    setLastRenderTime(endTime - startTime);
  });

  useEffect(() => {
    const handleScroll = (): void => {
      const timelineElement = document.querySelector('[data-timeline-container]');
      if (timelineElement) {
        setScrollPosition({
          x: timelineElement.scrollLeft,
          y: timelineElement.scrollTop
        });
      }
    };

    const timelineElement = document.querySelector('[data-timeline-container]');
    if (timelineElement) {
      timelineElement.addEventListener('scroll', handleScroll);
      return () => timelineElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const totalTimespan = timelineEnd.getTime() - timelineStart.getTime();
  const daySpan = Math.ceil(totalTimespan / (1000 * 60 * 60 * 24));
  const completedTasks = tasks.filter(task => task.status === 'completed').length;

  // Safely access memory information
  const getMemoryUsage = (): string => {
    try {
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return (memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
      }
    } catch (error) {
      // Silently handle memory access errors
    }
    return 'N/A';
  };

  return (
    <div className="p-3 border-b border-gray-800 space-y-2">
      <div className="text-xs font-medium text-green-400 mb-2">Performance Metrics</div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Renders:</span>
          <span className="font-mono">{renderCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Last Render:</span>
          <span className="font-mono">{lastRenderTime.toFixed(2)}ms</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Scroll X:</span>
          <span className="font-mono">{scrollPosition.x}px</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Scroll Y:</span>
          <span className="font-mono">{scrollPosition.y}px</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Completed:</span>
          <span className="font-mono">{completedTasks}/{tasks.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Timeline:</span>
          <span className="font-mono">{daySpan}d</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 pt-1 border-t border-gray-800">
        Memory: {getMemoryUsage()}MB
      </div>
    </div>
  );
};
