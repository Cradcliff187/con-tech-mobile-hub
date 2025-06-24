
import { useState, useCallback, useRef } from 'react';
import { Task } from '@/types/database';
import { toast } from '@/hooks/use-toast';

interface UseSimpleTimelineNavigationProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  tasks: Task[];
  onTimelineBoundsChange?: (start: Date, end: Date) => void;
}

export const useSimpleTimelineNavigation = ({
  timelineStart,
  timelineEnd,
  viewMode,
  tasks,
  onTimelineBoundsChange
}: UseSimpleTimelineNavigationProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  const updateScrollInfo = useCallback((container: HTMLDivElement | null) => {
    if (container) {
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    }
  }, []);

  const scrollToDate = useCallback((targetDate: Date, container: HTMLDivElement | null) => {
    if (!container) return;

    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((targetDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    const scrollableWidth = container.scrollWidth - container.clientWidth;
    const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
    
    const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
    
    container.scrollTo({
      left: centeredPosition,
      behavior: 'smooth'
    });
  }, [timelineStart, timelineEnd]);

  const scrollToToday = useCallback((container: HTMLDivElement | null) => {
    const today = new Date();
    
    if (today < timelineStart || today > timelineEnd) {
      // Expand timeline to include today if callback provided
      if (onTimelineBoundsChange) {
        const newStart = new Date(Math.min(today.getTime(), timelineStart.getTime()));
        const newEnd = new Date(Math.max(today.getTime(), timelineEnd.getTime()));
        
        newStart.setDate(newStart.getDate() - 14);
        newEnd.setDate(newEnd.getDate() + 14);
        
        onTimelineBoundsChange(newStart, newEnd);
        
        toast({
          title: "Timeline Expanded",
          description: "Timeline expanded to include today's date",
        });
      }
    } else {
      scrollToDate(today, container);
      
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
  }, [timelineStart, timelineEnd, onTimelineBoundsChange, scrollToDate]);

  const scrollLeft = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.75;
    
    container.scrollTo({
      left: Math.max(0, container.scrollLeft - scrollAmount),
      behavior: 'smooth'
    });
  }, []);

  const scrollRight = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.75;
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
    container.scrollTo({
      left: Math.min(maxScrollLeft, container.scrollLeft + scrollAmount),
      behavior: 'smooth'
    });
  }, []);

  const zoomToProject = useCallback((container: HTMLDivElement | null) => {
    if (tasks.length === 0) {
      toast({
        title: "No Tasks to Fit",
        description: "There are no tasks to fit in the timeline",
        variant: "destructive"
      });
      return;
    }

    // Calculate task bounds
    const taskDates = tasks
      .flatMap(task => [task.start_date, task.due_date])
      .filter(Boolean)
      .map(date => new Date(date!));

    if (taskDates.length === 0) {
      toast({
        title: "Invalid Task Dates",
        description: "No valid task dates found to fit timeline",
        variant: "destructive"
      });
      return;
    }

    const minDate = new Date(Math.min(...taskDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...taskDates.map(d => d.getTime())));

    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    if (onTimelineBoundsChange) {
      onTimelineBoundsChange(minDate, maxDate);
      
      setTimeout(() => {
        if (container) {
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        }
      }, 100);

      toast({
        title: "Timeline Fitted",
        description: `Timeline adjusted to fit ${tasks.length} tasks`,
      });
    }
  }, [tasks, onTimelineBoundsChange]);

  const hasScrollLeft = scrollPosition > 0;
  const hasScrollRight = scrollPosition < maxScroll;

  return {
    scrollToToday,
    scrollLeft,
    scrollRight,
    zoomToProject,
    hasScrollLeft,
    hasScrollRight,
    updateScrollInfo
  };
};
