
import { useMemo } from 'react';
import { getColumnIndexForDate, generateTimelineUnits, getColumnWidth } from './utils/gridUtils';

interface GanttTimelineGridProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttTimelineGrid = ({
  timelineStart,
  timelineEnd,
  viewMode
}: GanttTimelineGridProps) => {
  // Use the consolidated timeline generation system
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  // Calculate which column contains today's date
  const todayColumnIndex = useMemo(() => {
    const today = new Date();
    return getColumnIndexForDate(today, timelineUnits, viewMode);
  }, [timelineUnits, viewMode]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="min-w-max flex h-full">
        {timelineUnits.map((unit, unitIndex) => {
          const isCurrentColumn = unitIndex === todayColumnIndex;
          const isWeekendColumn = viewMode === 'days' && unit.isWeekend;
          
          return (
            <div
              key={unit.key}
              className={`flex-shrink-0 border-r border-slate-200 h-full transition-colors ${
                isCurrentColumn ? 'bg-blue-50 bg-opacity-50' : ''
              } ${
                isWeekendColumn ? 'bg-slate-50' : ''
              }`}
              style={{ width: `${columnWidth}px` }}
            />
          );
        })}
      </div>
    </div>
  );
};
