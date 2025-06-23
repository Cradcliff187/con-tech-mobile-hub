
import { useState, useCallback, useRef, useEffect } from 'react';
import { useGanttContext } from '@/contexts/gantt';
import { Task } from '@/types/database';
import { toast } from '@/hooks/use-toast';

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

  // Get context methods for timeline updates
  const { getFilteredTasks, setViewport, dispatch } = useGanttContext();

  const updateScrollInfo = useCallback(() => {
    if (activeScrollRef.current) {
      const container = activeScrollRef.current;
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  }, [activeScrollRef]);

  // Calculate task bounds for fitting
  const calculateTaskBounds = useCallback((tasks: Task[]): { start: Date; end: Date } | null => {
    const taskDates = tasks
      .flatMap(task => [task.start_date, task.due_date])
      .filter(Boolean)
      .map(date => new Date(date!));

    if (taskDates.length === 0) return null;

    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));

    // Add 7-day padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { start: minDate, end: maxDate };
  }, []);

  // Scroll to a specific date within the timeline
  const scrollToDate = useCallback((targetDate: Date) => {
    if (!activeScrollRef.current) return;

    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((targetDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const container = activeScrollRef.current;
    const scrollableWidth = container.scrollWidth - container.clientWidth;
    const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
    
    // Center the target date in the viewport
    const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
    
    container.scrollTo({
      left: centeredPosition,
      behavior: 'smooth'
    });
  }, [timelineStart, timelineEnd, activeScrollRef]);

  const scrollToToday = useCallback(() => {
    const today = new Date();
    
    // Check if today is within current timeline bounds
    if (today < timelineStart || today > timelineEnd) {
      // Expand timeline to include today
      const newStart = new Date(Math.min(today.getTime(), timelineStart.getTime()));
      const newEnd = new Date(Math.max(today.getTime(), timelineEnd.getTime()));
      
      // Add padding
      newStart.setDate(newStart.getDate() - 14);
      newEnd.setDate(newEnd.getDate() + 14);
      
      // Update timeline bounds
      dispatch({
        type: 'SET_TIMELINE_BOUNDS',
        payload: { start: newStart, end: newEnd }
      });
      
      // Wait for re-render and then scroll
      setTimeout(() => {
        scrollToDate(today);
      }, 100);
      
      toast({
        title: "Timeline Expanded",
        description: "Timeline expanded to include today's date",
      });
    } else {
      // Today is within bounds, just scroll to it
      scrollToDate(today);
      
      toast({
        title: "Navigated to Today",
        description: new Date().toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
      });
    }
  }, [timelineStart, timelineEnd, dispatch, scrollToDate]);

  const scrollLeft = useCallback(() => {
    if (!activeScrollRef.current) return;
    
    const container = activeScrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    
    container.scrollTo({
      left: Math.max(0, container.scrollLeft - scrollAmount),
      behavior: 'smooth'
    });
  }, [activeScrollRef]);

  const scrollRight = useCallback(() => {
    if (!activeScrollRef.current) return;
    
    const container = activeScrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    container.scrollTo({
      left: Math.min(maxScrollLeft, container.scrollLeft + scrollAmount),
      behavior: 'smooth'
    });
  }, [activeScrollRef]);

  const zoomToProject = useCallback(() => {
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      toast({
        title: "No Tasks to Fit",
        description: "There are no tasks to fit in the timeline",
        variant: "destructive"
      });
      return;
    }

    const bounds = calculateTaskBounds(filteredTasks);
    
    if (!bounds) {
      toast({
        title: "Invalid Task Dates",
        description: "No valid task dates found to fit timeline",
        variant: "destructive"
      });
      return;
    }

    // Update timeline bounds to fit all tasks
    dispatch({
      type: 'SET_TIMELINE_BOUNDS',
      payload: { start: bounds.start, end: bounds.end }
    });

    // Scroll to beginning after bounds update
    setTimeout(() => {
      if (activeScrollRef.current) {
        activeScrollRef.current.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }
    }, 100);

    toast({
      title: "Timeline Fitted",
      description: `Timeline adjusted to fit ${filteredTasks.length} tasks`,
    });
  }, [getFilteredTasks, calculateTaskBounds, dispatch, activeScrollRef]);

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
