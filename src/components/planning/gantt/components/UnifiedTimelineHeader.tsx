
import React from 'react';
import { format, startOfDay, addDays } from 'date-fns';
import { 
  getColumnWidth, 
  getTimelinePixelWidth,
  ROW_HEIGHT 
} from '../utils/unifiedGridUtils';

interface UnifiedTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const UnifiedTimelineHeader = ({
  timelineStart,
  timelineEnd,
  viewMode
}: UnifiedTimelineHeaderProps) => {
  const dayWidth = getColumnWidth(viewMode);
  const totalWidth = getTimelinePixelWidth(timelineStart, timelineEnd, dayWidth);
  
  // Generate date columns based on view mode
  const generateColumns = () => {
    const columns = [];
    let currentDate = startOfDay(timelineStart);
    let position = 0;
    
    while (currentDate <= timelineEnd) {
      let label: string;
      let nextDate: Date;
      
      switch (viewMode) {
        case 'days':
          label = format(currentDate, 'MMM d');
          nextDate = addDays(currentDate, 1);
          break;
        case 'weeks':
          label = format(currentDate, 'MMM d');
          nextDate = addDays(currentDate, 7);
          break;
        case 'months':
          label = format(currentDate, 'MMM yyyy');
          nextDate = addDays(currentDate, 30);
          break;
      }
      
      columns.push({
        key: currentDate.toISOString(),
        label,
        position,
        width: dayWidth * (viewMode === 'days' ? 1 : viewMode === 'weeks' ? 7 : 30)
      });
      
      position += dayWidth * (viewMode === 'days' ? 1 : viewMode === 'weeks' ? 7 : 30);
      currentDate = nextDate;
    }
    
    return columns;
  };

  const columns = generateColumns();

  return (
    <div 
      className="border-b border-slate-200 bg-slate-50 relative"
      style={{ width: `${totalWidth}px`, height: `${ROW_HEIGHT}px` }}
    >
      {columns.map((column) => (
        <div
          key={column.key}
          className="absolute border-r border-slate-200 flex items-center justify-center text-xs font-medium text-slate-700"
          style={{
            left: `${column.position}px`,
            width: `${column.width}px`,
            height: `${ROW_HEIGHT}px`
          }}
        >
          {column.label}
        </div>
      ))}
      
      {/* Today indicator */}
      <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
           style={{ left: `${getColumnWidth(viewMode) * Math.floor(Date.now() / (24 * 60 * 60 * 1000)) - Math.floor(timelineStart.getTime() / (24 * 60 * 60 * 1000))}px` }} />
    </div>
  );
};
