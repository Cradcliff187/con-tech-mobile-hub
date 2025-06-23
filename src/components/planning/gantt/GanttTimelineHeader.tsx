
import { useRef, useEffect } from 'react';
import { GanttTimelineNavigation } from './GanttTimelineNavigation';
import { GanttCurrentDateIndicator } from './GanttCurrentDateIndicator';
import { useTimelineNavigation } from './hooks/useTimelineNavigation';
import { useTimelineUnits } from './hooks/useTimelineUnits';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const GanttTimelineHeader = ({
  timelineStart,
  timelineEnd,
  viewMode,
  scrollRef
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
  } = useTimelineNavigation({
    timelineStart,
    timelineEnd,
    viewMode,
    scrollContainerRef: headerScrollRef
  });

  const timelineUnits = useTimelineUnits(timelineStart, timelineEnd, viewMode);

  // Update scroll info when scrolling
  useEffect(() => {
    const handleScroll = () => {
      updateScrollInfo();
    };

    if (headerScrollRef.current) {
      headerScrollRef.current.addEventListener('scroll', handleScroll, { passive: true });
      updateScrollInfo();
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
            <div className="min-w-max relative">
              {/* Timeline units */}
              <div className="flex h-8 bg-slate-50">
                {timelineUnits.map((unit, index) => (
                  <div
                    key={unit.key}
                    className={`flex-shrink-0 px-1 py-1 text-xs font-medium border-r border-slate-200 flex items-center justify-center transition-colors hover:bg-slate-100 ${
                      unit.isWeekend ? 'bg-slate-100 text-slate-500' : 'text-slate-700'
                    } ${
                      viewMode === 'days' ? 'w-16' : viewMode === 'weeks' ? 'w-20' : 'w-24'
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
