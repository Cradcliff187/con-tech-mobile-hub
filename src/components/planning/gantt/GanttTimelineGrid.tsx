
import { useMemo } from 'react';
import { generateTimelineUnits, getColumnWidth } from './utils/gridUtils';

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
  const timelineUnits = useMemo(() => 
    generateTimelineUnits(timelineStart, timelineEnd, viewMode),
    [timelineStart, timelineEnd, viewMode]
  );
  const columnWidth = getColumnWidth(viewMode);

  // Calculate which column contains today's date
  const todayColumnIndex = useMemo(() => {
    const today = new Date();
    const todayTime = today.getTime();
    
    for (let i = 0; i < timelineUnits.length; i++) {
      const unitDate = new Date(timelineUnits[i].key);
      const nextUnitDate = i < timelineUnits.length - 1 
        ? new Date(timelineUnits[i + 1].key)
        : new Date(unitDate.getTime() + (viewMode === 'days' ? 24 * 60 * 60 * 1000 : 
                                      viewMode === 'weeks' ? 7 * 24 * 60 * 60 * 1000 :
                                      30 * 24 * 60 * 60 * 1000));
      
      if (todayTime >= unitDate.getTime() && todayTime < nextUnitDate.getTime()) {
        return i;
      }
    }
    
    return -1; // Today is not within the timeline range
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
