
import { startOfDay, addDays, addWeeks, addMonths, format, isWeekend } from 'date-fns';

export interface TimelineUnit {
  key: string;
  label: string;
  date: Date;
  isWeekend?: boolean;
}

export const getColumnWidth = (viewMode: 'days' | 'weeks' | 'months'): number => {
  switch (viewMode) {
    case 'days': return 64; // 16 * 4 = 64px per day
    case 'weeks': return 80; // 20 * 4 = 80px per week  
    case 'months': return 96; // 24 * 4 = 96px per month
    default: return 80;
  }
};

export const generateTimelineUnits = (
  startDate: Date, 
  endDate: Date, 
  viewMode: 'days' | 'weeks' | 'months'
): TimelineUnit[] => {
  const units: TimelineUnit[] = [];
  let currentDate = startOfDay(startDate);
  const end = startOfDay(endDate);

  while (currentDate <= end) {
    let label: string;
    let nextDate: Date;

    switch (viewMode) {
      case 'days':
        label = format(currentDate, 'MMM d');
        nextDate = addDays(currentDate, 1);
        break;
      case 'weeks':
        label = format(currentDate, 'MMM d');
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'months':
        label = format(currentDate, 'MMM yyyy');
        nextDate = addMonths(currentDate, 1);
        break;
      default:
        label = format(currentDate, 'MMM d');
        nextDate = addDays(currentDate, 1);
    }

    units.push({
      key: currentDate.toISOString(),
      label,
      date: new Date(currentDate),
      isWeekend: viewMode === 'days' ? isWeekend(currentDate) : false
    });

    currentDate = nextDate;
  }

  return units;
};

// Utility to get date from pixel position
export const getDateFromPixelPosition = (
  pixelX: number,
  containerWidth: number,
  timelineStart: Date,
  timelineEnd: Date
): Date => {
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const positionPercent = pixelX / containerWidth;
  const daysFromStart = positionPercent * totalDays;
  
  return new Date(timelineStart.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
};
