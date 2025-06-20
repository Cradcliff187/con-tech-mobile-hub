
import { useMemo } from 'react';
import { getColumnIndexForDate } from './utils/gridUtils';
import { useTimelineUnits } from './hooks/useTimelineUnits';

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
  // Use the centralized timeline units hook
  const timelineUnits = useTimelineUnits(timelineStart, timelineEnd, viewMode);

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
              className={`flex-shrink-0 border-r border-slate-100 h-full ${
                viewMode === 'days' ? 'w-24' : viewMode === 'weeks' ? 'w-32' : 'w-40'
              } ${
                isCurrentColumn ? 'bg-blue-50 bg-opacity-50' : ''
              } ${
                isWeekendColumn ? 'bg-slate-50' : ''
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
