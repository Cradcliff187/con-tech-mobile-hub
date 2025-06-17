
import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTimelineNavigationProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export const useTimelineNavigation = ({
  timelineStart,
  timelineEnd,
  viewMode,
  scrollContainerRef
}: UseTimelineNavigationProps) => {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const activeScrollRef = scrollContainerRef || internalScrollRef;
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const updateScrollInfo = useCallback(() => {
    if (activeScrollRef.current) {
      const container = activeScrollRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  }, [activeScrollRef]);

  const scrollToToday = useCallback(() => {
    if (!activeScrollRef.current) return;

    const today = new Date();
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const container = activeScrollRef.current;
    const scrollableWidth = container.scrollWidth - container.clientWidth;
    const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
    
    // Center today in the viewport
    const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
    
    container.scrollTo({
      left: centeredPosition,
      behavior: 'smooth'
    });
  }, [timelineStart, timelineEnd, activeScrollRef]);

  const scrollLeft = useCallback(() => {
    if (!activeScrollRef.current) return;
    
    const container = activeScrollRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of viewport
    
    container.scrollTo({
      left: Math.max(0, container.scrollLeft - scrollAmount),
      behavior: 'smooth'
    });
  }, [activeScrollRef]);

  const scrollRight = useCallback(() => {
    if (!activeScrollRef.current) return;
    
    const container = activeScrollRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of viewport
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    container.scrollTo({
      left: Math.min(maxScrollLeft, container.scrollLeft + scrollAmount),
      behavior: 'smooth'
    });
  }, [activeScrollRef]);

  const zoomToProject = useCallback(() => {
    if (!activeScrollRef.current) return;
    
    const container = activeScrollRef.current;
    container.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  }, [activeScrollRef]);

  const hasScrollLeft = scrollPosition > 0;
  const hasScrollRight = scrollPosition < maxScroll;

  return {
    scrollContainerRef: activeScrollRef,
    scrollToToday,
    scrollLeft,
    scrollRight,
    zoomToProject,
    hasScrollLeft,
    hasScrollRight,
    updateScrollInfo
  };
};
