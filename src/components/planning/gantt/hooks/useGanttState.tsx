
import { useState, useEffect } from 'react';

interface UseGanttStateProps {
  timelineStart: Date;
  timelineEnd: Date;
}

export const useGanttState = ({ timelineStart, timelineEnd }: UseGanttStateProps) => {
  // Safe initialization with fallback dates, then sync with timeline calculation
  const [currentViewStart, setCurrentViewStart] = useState(new Date());
  const [currentViewEnd, setCurrentViewEnd] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [timelineReady, setTimelineReady] = useState(false);

  // Sync mini-map viewport with calculated timeline values once they're ready
  useEffect(() => {
    // Validate that we have proper Date objects before using them
    if (timelineStart instanceof Date && !isNaN(timelineStart.getTime()) && 
        timelineEnd instanceof Date && !isNaN(timelineEnd.getTime())) {
      setCurrentViewStart(timelineStart);
      setCurrentViewEnd(timelineEnd);
      setTimelineReady(true);
    }
  }, [timelineStart, timelineEnd]);

  const handleMiniMapViewportChange = (start: Date, end: Date) => {
    setCurrentViewStart(start);
    setCurrentViewEnd(end);
    // Implement actual viewport scrolling here
  };

  return {
    currentViewStart,
    currentViewEnd,
    showMiniMap,
    setShowMiniMap,
    timelineReady,
    handleMiniMapViewportChange
  };
};
