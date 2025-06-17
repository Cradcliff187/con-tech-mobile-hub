
import { useState, useCallback, useRef } from 'react';

interface UseTimelineNavigationProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const useTimelineNavigation = ({
  timelineStart,
  timelineEnd,
  viewMode
}: UseTimelineNavigationProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const updateScrollInfo = useCallback(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  }, []);

  const scrollToToday = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const today = new Date();
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const container = scrollContainerRef.current;
    const scrollableWidth = container.scrollWidth - container.clientWidth;
    const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
    
    // Center today in the viewport
    const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
    
    container.scrollTo({
      left: centeredPosition,
      behavior: 'smooth'
    });
  }, [timelineStart, timelineEnd]);

  const scrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of viewport
    
    container.scrollTo({
      left: Math.max(0, container.scrollLeft - scrollAmount),
      behavior: 'smooth'
    });
  }, []);

  const scrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.75; // Scroll 75% of viewport
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    container.scrollTo({
      left: Math.min(maxScrollLeft, container.scrollLeft + scrollAmount),
      behavior: 'smooth'
    });
  }, []);

  const zoomToProject = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    container.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const hasScrollLeft = scrollPosition > 0;
  const hasScrollRight = scrollPosition < maxScroll;

  return {
    scrollContainerRef,
    scrollToToday,
    scrollLeft,
    scrollRight,
    zoomToProject,
    hasScrollLeft,
    hasScrollRight,
    updateScrollInfo
  };
};
