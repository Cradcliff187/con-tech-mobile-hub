
import { getDaysBetween } from './ganttUtils';

interface GanttTimelineHeaderProps {
  timelineStart: Date;
  timelineEnd: Date;
}

export const GanttTimelineHeader = ({ timelineStart, timelineEnd }: GanttTimelineHeaderProps) => {
  const generateTimelineHeaders = () => {
    const headers = [];
    const totalDays = getDaysBetween(timelineStart, timelineEnd);
    const current = new Date(timelineStart);
    
    for (let i = 0; i < totalDays; i += 7) {
      const isToday = new Date().toDateString() === current.toDateString();
      headers.push(
        <div key={i} className={`text-xs px-3 py-2 border-r border-slate-200 min-w-[100px] text-center ${isToday ? 'bg-orange-50 font-semibold text-orange-700' : 'text-slate-600'}`}>
          <div className="font-medium">{current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          <div className="text-xs text-slate-400">Week {Math.ceil(i / 7) + 1}</div>
        </div>
      );
      current.setDate(current.getDate() + 7);
    }
    
    return headers;
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <div className="flex">
        <div className="w-80 lg:w-96 px-4 py-3 border-r border-slate-200 font-semibold text-slate-700 bg-white">
          Task Details
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
