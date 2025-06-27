
import React from 'react';
import { 
  generateTimelineColumns,
  getTodayIndicatorPosition,
  ROW_CONFIG,
  TimelineBounds
} from '../utils/coreGridSystem';

interface UnifiedTimelineHeaderProps {
  timelineBounds: TimelineBounds;
  viewMode: 'days' | 'weeks' | 'months';
}

export const UnifiedTimelineHeader = ({
  timelineBounds,
  viewMode
}: UnifiedTimelineHeaderProps) => {
  const columns = generateTimelineColumns(
    timelineBounds.start,
    timelineBounds.end,
    viewMode
  );
  
  const todayPosition = getTodayIndicatorPosition(timelineBounds, viewMode);

  return (
    <div 
      className="border-b border-slate-200 bg-slate-50 relative"
      style={{ 
        width: `${timelineBounds.totalWidth}px`, 
        height: `${ROW_CONFIG.height}px` 
      }}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          className="absolute border-r border-slate-200 flex items-center justify-center text-xs font-medium text-slate-700"
          style={{
            left: `${column.position}px`,
            width: `${column.width}px`,
            height: `${ROW_CONFIG.height}px`
          }}
        >
          {column.label}
        </div>
      ))}
      
      {/* Today indicator */}
      {todayPosition !== null && (
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
          style={{ left: `${todayPosition}px` }} 
        />
      )}
    </div>
  );
};
