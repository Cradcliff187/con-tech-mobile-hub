
import { getDaysBetween } from './ganttUtils';
import { GanttTimelineNavigation } from './GanttTimelineNavigation';
import { GanttCurrentDateIndicator } from './GanttCurrentDateIndicator';
import { useTimelineNavigation } from './hooks/useTimelineNavigation';
import { useEffect } from 'react';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode?: 'days' | 'weeks' | 'months';
  onScrollUpdate?: (ref: React.RefObject<HTMLDivElement>) => void;
}

export const GanttTimelineHeader = ({ 
  timelineStart, 
  timelineEnd, 
  viewMode = 'weeks',
  onScrollUpdate
}: GanttTimelineHeaderProps) => {
  
  const timelineNavigation = useTimelineNavigation({
    timelineStart,
    timelineEnd,
    viewMode
  });

  // Provide scroll container ref to parent
  useEffect(() => {
    if (onScrollUpdate) {
      onScrollUpdate(timelineNavigation.scrollContainerRef);
    }
  }, [onScrollUpdate, timelineNavigation.scrollContainerRef]);

  const generateDaysView = () => {
    const headers = [];
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < totalDays; i++) {
      const isToday = current.toDateString() === today.toDateString();
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      
      headers.push(
        <div 
          key={i} 
          className={`text-xs px-1 py-2 border-r border-slate-200 min-w-[80px] max-w-[80px] text-center flex-shrink-0 ${
            isToday ? 'bg-orange-200 font-bold text-orange-800 shadow-sm' : 
            isWeekend ? 'bg-slate-100 text-slate-500' : 'bg-white text-slate-700'
          }`}
        >
          <div className="font-semibold text-sm">
            {current.getDate()}
          </div>
          <div className="text-xs font-medium">
            {current.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-xs text-slate-400">
            {current.toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
        </div>
      );
      current.setDate(current.getDate() + 1);
    }
    
    return headers;
  };

  const generateWeeksView = () => {
    const headers = [];
    const current = new Date(timelineStart);
    const today = new Date();
    
    // Align to week boundaries (Sunday start)
    const startOfWeek = new Date(current);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    let weekCount = 0;
    while (startOfWeek < timelineEnd) {
      const weekEnd = new Date(startOfWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const isCurrentWeek = today >= startOfWeek && today <= weekEnd;
      
      headers.push(
        <div 
          key={weekCount} 
          className={`text-xs px-2 py-2 border-r border-slate-200 min-w-[140px] max-w-[140px] text-center flex-shrink-0 ${
            isCurrentWeek ? 'bg-blue-100 font-semibold text-blue-800 shadow-sm' : 'bg-white text-slate-700'
          }`}
        >
          <div className="font-semibold text-sm">
            Week {weekCount + 1}
          </div>
          <div className="font-medium text-xs">
            {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-slate-500">
            {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      );
      
      startOfWeek.setDate(startOfWeek.getDate() + 7);
      weekCount++;
    }
    
    return headers;
  };

  const generateMonthsView = () => {
    const headers = [];
    const current = new Date(timelineStart.getFullYear(), timelineStart.getMonth(), 1);
    const end = new Date(timelineEnd.getFullYear(), timelineEnd.getMonth() + 1, 0);
    const today = new Date();
    
    while (current <= end) {
      const monthStart = new Date(current);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      const isCurrentMonth = today.getFullYear() === current.getFullYear() && 
                           today.getMonth() === current.getMonth();
      
      // Calculate dynamic width based on days in month
      const daysInMonth = monthEnd.getDate();
      const minWidth = Math.max(200, daysInMonth * 8);
      
      headers.push(
        <div 
          key={`${current.getFullYear()}-${current.getMonth()}`}
          className={`text-xs px-3 py-2 border-r border-slate-200 text-center flex-shrink-0 ${
            isCurrentMonth ? 'bg-slate-200 font-bold text-slate-800 shadow-sm' : 'bg-slate-50 text-slate-700'
          }`}
          style={{ minWidth: `${minWidth}px`, maxWidth: `${minWidth}px` }}
        >
          <div className="font-bold text-sm mb-1">
            {current.toLocaleDateString('en-US', { month: 'long' })}
          </div>
          <div className="text-xs text-slate-500 mb-2">
            {current.getFullYear()} • {daysInMonth} days
          </div>
          
          {/* Week subdivisions with better styling */}
          <div className="grid grid-cols-4 gap-1 text-xs">
            {Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIndex) => {
              const weekStart = weekIndex * 7 + 1;
              const weekEnd = Math.min((weekIndex + 1) * 7, daysInMonth);
              return (
                <div 
                  key={weekIndex} 
                  className="bg-white bg-opacity-60 rounded px-1 py-0.5 text-slate-600"
                >
                  W{weekIndex + 1}
                  <div className="text-xs text-slate-500">
                    {weekStart}-{weekEnd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return headers;
  };

  const generateTimelineHeaders = () => {
    switch (viewMode) {
      case 'days':
        return generateDaysView();
      case 'months':
        return generateMonthsView();
      case 'weeks':
      default:
        return generateWeeksView();
    }
  };

  const getViewModeInfo = () => {
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const startDate = timelineStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = timelineEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const viewModeLabels = {
      days: `Daily View • ${totalDays} days`,
      weeks: `Weekly View • ${Math.ceil(totalDays / 7)} weeks`,
      months: `Monthly View • ${Math.ceil(totalDays / 30)} months`
    };
    
    return {
      label: viewModeLabels[viewMode],
      range: `${startDate} - ${endDate}`
    };
  };

  const viewInfo = getViewModeInfo();

  return (
    <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-300 shadow-sm">
      <div className="flex">
        <div className="w-80 lg:w-96 px-4 py-3 border-r-2 border-slate-300 bg-white shadow-sm flex items-center justify-between">
          <div>
            <div className="font-bold text-slate-800 text-sm">Task Details</div>
            <div className="text-xs text-slate-600 mt-1 font-medium">{viewInfo.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{viewInfo.range}</div>
          </div>
        </div>

        {/* Timeline Navigation Controls */}
        <GanttTimelineNavigation
          onGoToToday={timelineNavigation.scrollToToday}
          onScrollLeft={timelineNavigation.scrollLeft}
          onScrollRight={timelineNavigation.scrollRight}
          onZoomToProject={timelineNavigation.zoomToProject}
          currentDate={new Date()}
          viewMode={viewMode}
          hasScrollLeft={timelineNavigation.hasScrollLeft}
          hasScrollRight={timelineNavigation.hasScrollRight}
        />

        {/* Scrollable Timeline Headers */}
        <div className="flex-1 relative">
          <div 
            ref={timelineNavigation.scrollContainerRef}
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
            onScroll={timelineNavigation.updateScrollInfo}
          >
            <div className="flex min-w-max relative">
              {generateTimelineHeaders()}
              
              {/* Current Date Indicator */}
              <GanttCurrentDateIndicator
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            </div>

            {/* Scroll Shadows */}
            {timelineNavigation.hasScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-100 to-transparent pointer-events-none z-10"></div>
            )}
            {timelineNavigation.hasScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100 to-transparent pointer-events-none z-10"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
