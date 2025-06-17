
import { useMemo } from 'react';
import { getColumnIndexForDate } from './ganttUtils';

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
  // Generate timeline units based on view mode (same logic as GanttTimelineHeader)
  const timelineUnits = useMemo(() => {
    const units = [];
    const current = new Date(timelineStart);
    
    while (current <= timelineEnd) {
      switch (viewMode) {
        case 'days':
          units.push({
            key: current.getTime(),
            label: current.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            }),
            isWeekend: current.getDay() === 0 || current.getDay() === 6
          });
          current.setDate(current.getDate() + 1);
          break;
          
        case 'weeks':
          // Start of week (Sunday)
          const weekStart = new Date(current);
          weekStart.setDate(current.getDate() - current.getDay());
          units.push({
            key: weekStart.getTime(),
            label: weekStart.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric'
            }),
            isWeekend: false
          });
          current.setDate(current.getDate() + 7);
          break;
          
        case 'months':
          units.push({
            key: current.getTime(),
            label: current.toLocaleDateString('en-US', { 
              month: 'short',
              year: 'numeric'
            }),
            isWeekend: false
          });
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }
    
    return units;
  }, [timelineStart, timelineEnd, viewMode]);

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
