import { addDays, differenceInDays, format } from 'date-fns';

export interface MarkerData {
  id: string;
  type: 'milestone' | 'weather' | 'conflict' | 'critical' | 'compound';
  position: { x: number; y: number };
  priority: number;
  color: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  tooltip?: {
    title: string;
    description: string;
    details?: Record<string, any>;
  };
}

export const MARKER_ZONES = {
  BACKGROUND: { zIndex: 10 },
  TERTIARY: { zIndex: 20 },
  SECONDARY: { zIndex: 30 },
  PRIMARY: { zIndex: 40 }
};

export const getMarkerPosition = (
  date: Date,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months' = 'days'
): { left: number; isVisible: boolean } => {
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  const dayWidth = 100 / totalDays;
  const daysFromStart = differenceInDays(date, timelineStart);
  let left = daysFromStart * dayWidth;

  if (viewMode === 'weeks') {
    const totalWeeks = totalDays / 7;
    const weekWidth = 100 / totalWeeks;
    const weeksFromStart = daysFromStart / 7;
    left = weeksFromStart * weekWidth;
  } else if (viewMode === 'months') {
    const start = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    const end = new Date(timelineEnd.getFullYear(), timelineEnd.getMonth() + 1, 0);
    const totalMonths = end.getMonth() - start.getMonth() + (12 * (end.getFullYear() - start.getFullYear())) + 1;
    const monthWidth = 100 / totalMonths;
    let monthsFromStart = 0;
    let currentDate = new Date(start);
    while (currentDate < date) {
      monthsFromStart++;
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    left = monthsFromStart * monthWidth;
  }

  const isVisible = left >= 0 && left <= 100;
  return { left, isVisible };
};

export const getMarkerVerticalPosition = (type: string): { top: number; zIndex: number } => {
  switch (type) {
    case 'milestone':
      return { top: 20, zIndex: MARKER_ZONES.PRIMARY.zIndex };
    case 'weather':
      return { top: 45, zIndex: MARKER_ZONES.TERTIARY.zIndex };
    case 'conflict':
      return { top: 70, zIndex: MARKER_ZONES.SECONDARY.zIndex };
    default:
      return { top: 50, zIndex: 1 };
  }
};

export const getMarkerColor = (type: string, severity: string = 'medium'): string => {
  switch (type) {
    case 'milestone':
      return 'bg-blue-500';
    case 'weather':
      if (severity === 'high') return 'bg-red-500';
      if (severity === 'moderate') return 'bg-orange-500';
      return 'bg-blue-500';
    case 'conflict':
      if (severity === 'high') return 'bg-red-600';
      if (severity === 'medium') return 'bg-orange-600';
      return 'bg-yellow-600';
    default:
      return 'bg-gray-500';
  }
};

export const isMarkerVisible = (positionX: number, minVisible: number = 0, maxVisible: number = 100): boolean => {
  return positionX >= minVisible && positionX <= maxVisible;
};

export const batchMarkerUpdates = (
  markers: MarkerData[],
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): MarkerData[] => {
  return markers.map(marker => {
    const { left, isVisible } = getMarkerPosition(new Date(), timelineStart, timelineEnd, viewMode);
    return {
      ...marker,
      position: {
        x: left,
        y: getMarkerVerticalPosition(marker.type).top
      },
      isVisible
    };
  });
};
