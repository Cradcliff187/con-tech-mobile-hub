
import { useMemo } from 'react';

export interface TimelineUnit {
  key: number;
  label: string;
  isWeekend: boolean;
}

export const useTimelineUnits = (
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  return useMemo(() => {
    const units: TimelineUnit[] = [];
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
};
