
import { useRef, useEffect } from 'react';
import { GanttTimelineNavigation } from './GanttTimelineNavigation';
import { GanttCurrentDateIndicator } from './GanttCurrentDateIndicator';
import { useTimelineNavigation } from './hooks/useTimelineNavigation';
import { useTimelineUnits } from './hooks/useTimelineUnits';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  onScrollUpdate?: (scrollContainerRef: React.RefObject<HTMLDivElement>) => void;
}

export const GanttTimelineHeader = ({
  timelineStart,
  timelineEnd,
  viewMode,
  onScrollUpdate
}: GanttTimelineHeaderProps) => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  
  const {
    scrollToToday,
    scrollLeft,
    scrollRight,
    zoomToProject,
    hasScrollLeft,
    hasScrollRight,
    updateScrollInfo
  } = useTimelineNavigation({
    timelineStart,
    timelineEnd,
    viewMode
  });

  // Use the centralized timeline units hook
  const timelineUnits = useTimelineUnits(timelineStart, timelineEnd, viewMode);

  // Update scroll info when scrolling
  useEffect(() => {
    const handleScroll = () => {
      updateScrollInfo();
    };

    if (headerScrollRef.current) {
      headerScrollRef.current.addEventListener('scroll', handleScroll);
      updateScrollInfo(); // Initial update
    }

    return () => {
      if (headerScrollRef.current) {
        headerScrollRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [updateScrollInfo]);

  // Sync with content scroll
  useEffect(() => {
    if (onScrollUpdate && headerScrollRef.current) {
      onScrollUpdate(headerScrollRef);
    }
  }, [onScrollUpdate]);

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="flex">
        {/* Left side - Navigation controls */}
        <div className="w-80 lg:w-96 border-r border-slate-200 bg-white">
          <GanttTimelineNavigation
            onGoToToday={scrollToToday}
            onScrollLeft={scrollLeft}
            onScrollRight={scrollRight}
            onZoomToProject={zoomToProject}
            currentDate={new Date()}
            viewMode={viewMode}
            hasScrollLeft={hasScrollLeft}
            hasScrollRight={hasScrollRight}
          />
        </div>

        {/* Right side - Timeline header */}
        <div className="flex-1 relative">
          <div 
            ref={headerScrollRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
          >
            <div className="min-w-max relative">
              {/* Timeline units */}
              <div className="flex h-12 bg-slate-50">
                {timelineUnits.map((unit, index) => (
                  <div
                    key={unit.key}
                    className={`flex-shrink-0 px-2 py-2 text-xs font-medium border-r border-slate-200 flex items-center justify-center ${
                      unit.isWeekend ? 'bg-slate-100 text-slate-500' : 'text-slate-700'
                    } ${
                      viewMode === 'days' ? 'w-24' : viewMode === 'weeks' ? 'w-32' : 'w-40'
                    }`}
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
