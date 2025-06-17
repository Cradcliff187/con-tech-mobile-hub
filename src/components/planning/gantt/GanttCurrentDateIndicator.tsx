
interface GanttCurrentDateIndicatorProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttCurrentDateIndicator = ({
  timelineStart,
  timelineEnd,
  viewMode
}: GanttCurrentDateIndicatorProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today is within the visible timeline
  if (today < timelineStart || today > timelineEnd) {
    return null;
  }

  // Calculate position
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysFromStart = Math.ceil((today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const position = (daysFromStart / totalDays) * 100;

  return (
    <div 
      className="absolute top-0 bottom-0 z-10 pointer-events-none"
      style={{ left: `${position}%` }}
    >
      {/* Today line */}
      <div className="w-0.5 h-full bg-orange-500 shadow-sm"></div>
      
      {/* Today indicator */}
      <div className="absolute -top-1 -left-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>

      {/* Today label */}
      <div className="absolute -top-8 -left-8 bg-orange-500 text-white text-xs px-2 py-1 rounded shadow-md font-medium">
        Today
      </div>
    </div>
  );
};
