
import { getDaysBetween } from './ganttUtils';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode?: 'days' | 'weeks' | 'months';
}

export const GanttTimelineHeader = ({ 
  timelineStart, 
  timelineEnd, 
  viewMode = 'weeks' 
}: GanttTimelineHeaderProps) => {
  
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
          className={`text-xs px-2 py-2 border-r border-slate-200 min-w-[60px] text-center flex-shrink-0 ${
            isToday ? 'bg-orange-100 font-semibold text-orange-700' : 
            isWeekend ? 'bg-slate-50 text-slate-500' : 'text-slate-600'
          }`}
        >
          <div className="font-medium">
            {current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    const today = new Date();
    
    // Align to week boundaries
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
          className={`text-xs px-3 py-2 border-r border-slate-200 min-w-[120px] text-center flex-shrink-0 ${
            isCurrentWeek ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-600'
          }`}
        >
          <div className="font-medium">
            {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}
          </div>
          <div className="text-xs text-slate-400">
            Week {weekCount + 1}
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
      
      // Calculate month width based on days in month
      const daysInMonth = monthEnd.getDate();
      const totalProjectDays = getDaysBetween(timelineStart, timelineEnd);
      const monthWidth = Math.max(150, (daysInMonth / totalProjectDays) * 800);
      
      headers.push(
        <div 
          key={`${current.getFullYear()}-${current.getMonth()}`}
          className={`text-xs px-4 py-2 border-r border-slate-200 text-center flex-shrink-0 ${
            isCurrentMonth ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-600'
          }`}
          style={{ minWidth: `${monthWidth}px` }}
        >
          <div className="font-medium text-sm">
            {current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {daysInMonth} days
          </div>
          
          {/* Week subdivisions */}
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            {Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, weekIndex) => (
              <span key={weekIndex} className="text-xs">
                W{weekIndex + 1}
              </span>
            ))}
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

  const getViewModeLabel = () => {
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const startDate = timelineStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = timelineEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return `${startDate} - ${endDate} (${totalDays} days)`;
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <div className="flex">
        <div className="w-80 lg:w-96 px-4 py-3 border-r border-slate-200 bg-white">
          <div className="font-semibold text-slate-700">Task Details</div>
          <div className="text-xs text-slate-500 mt-1">{getViewModeLabel()}</div>
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max">
            {generateTimelineHeaders()}
          </div>
        </div>
      </div>
    </div>
  );
};
