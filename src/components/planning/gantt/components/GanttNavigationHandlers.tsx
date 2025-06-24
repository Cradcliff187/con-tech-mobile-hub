
export class GanttNavigationHandlers {
  static handleNavigateToDate = (
    date: Date, 
    timelineRef: React.RefObject<HTMLDivElement>, 
    timelineStart: Date, 
    timelineEnd: Date
  ): void => {
    if (timelineRef.current) {
      const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysFromStart = Math.ceil((date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      
      const container = timelineRef.current;
      const scrollableWidth = container.scrollWidth - container.clientWidth;
      const targetPosition = (daysFromStart / totalDays) * scrollableWidth;
      
      const centeredPosition = Math.max(0, targetPosition - container.clientWidth / 2);
      
      container.scrollTo({
        left: centeredPosition,
        behavior: 'smooth'
      });
    }
  };
}
