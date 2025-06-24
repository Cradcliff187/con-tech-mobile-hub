
import { useRef, useEffect } from 'react';
import { Task } from '@/types/database';
import { GanttTimelineNavigation } from './GanttTimelineNavigation';
import { GanttCurrentDateIndicator } from './GanttCurrentDateIndicator';
import { useSimpleTimelineNavigation } from './hooks/useSimpleTimelineNavigation';
import { generateTimelineUnits, getColumnWidth } from './utils/gridUtils';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  tasks?: Task[];
  scrollRef?: React.RefObject<HTMLDivElement>;
  onTimelineBoundsChange?: (start: Date, end: Date) => void;
}

export const GanttTimelineHeader = ({
  timelineStart,
  timelineEnd,
  viewMode,
  tasks = [],
  scrollRef,
  onTimelineBoundsChange
}: GanttTimelineHeaderProps) => {
  const internalScrollRef = useRef<HTMLDivElement>(null);
  const headerScrollRef = scrollRef || internalScrollRef;
  
  const {
    scrollToToday,
    scrollLeft,
    scrollRight,
    zoomToProject,
    hasScrollLeft,
    hasScrollRight,
    updateScrollInfo
  } = useSimpleTimelineNavigation({
    timelineStart,
    timelineEnd,
    viewMode,
    tasks,
    onTimelineBoundsChange
  });

  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  // Handle navigation actions with current scroll container
  const handleScrollToToday = () => scrollToToday(headerScrollRef.current);
  const handleScrollLeft = () => scrollLeft(headerScrollRef.current);
  const handleScrollRight = () => scrollRight(headerScrollRef.current);
  const handleZoomToProject = () => zoomToProject(headerScrollRef.current);

  // Update scroll info when scrolling
  useEffect(() => {
    const handleScroll = () => {
      updateScrollInfo(headerScrollRef.current);
    };

    if (headerScrollRef.current) {
      headerScrollRef.current.addEventListener('scroll', handleScroll, { passive: true });
      updateScrollInfo(headerScrollRef.current);
    }

    return () => {
      if (headerScrollRef.current) {
        headerScrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [updateScrollInfo, headerScrollRef]);

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="flex">
        {/* Left side - Navigation controls */}
        <div className="w-64 lg:w-72 border-r border-slate-200 bg-white flex-shrink-0">
          <GanttTimelineNavigation
            onGoToToday={handleScrollToToday}
            onScrollLeft={handleScrollLeft}
            onScrollRight={handleScrollRight}
            onZoomToProject={handleZoomToProject}
            currentDate={new Date()}
            viewMode={viewMode}
            hasScrollLeft={hasScrollLeft}
            hasScrollRight={hasScrollRight}
          />
        </div>

        {/* Right side - Timeline header with master scroll */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={headerScrollRef}
            className="overflow-x-auto scrollbar-none md:scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 touch-pan-x"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin'
            }}
          >
            <div className="min-w-max relative" style={{ width: `${timelineUnits.length * columnWidth}px` }}>
              {/* Timeline units */}
              <div className="flex h-8 bg-slate-50">
                {timelineUnits.map((unit) => (
                  <div
                    key={unit.key}
                    className={`flex-shrink-0 px-1 py-1 text-xs font-medium border-r border-slate-200 flex items-center justify-center transition-colors hover:bg-slate-100 ${
                      unit.isWeekend ? 'bg-slate-100 text-slate-500' : 'text-slate-700'
                    }`}
                    style={{ width: `${columnWidth}px` }}
                  >
                    {unit.label}
                  </div>
                ))}
              </div>

              {/* Current date indicator */}
              <GanttCurrentDateIndicator
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
