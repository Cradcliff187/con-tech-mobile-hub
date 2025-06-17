
import { Cloud, CloudRain, Snowflake, Sun } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMarkerPosition, getMarkerVerticalPosition, getMarkerColor } from '../utils/overlayUtils';

interface GanttWeatherMarkersProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

// Mock weather delays - in production this would come from weather API or user input
const getWeatherDelays = (start: Date, end: Date) => {
  const delays = [];
  const current = new Date(start);
  
  while (current <= end) {
    // Simulate some weather events
    if (current.getDay() === 3 && Math.random() > 0.8) { // Random Wednesday delays
      delays.push({
        id: `weather-${current.getTime()}`,
        date: new Date(current),
        type: 'rain' as const,
        severity: 'moderate' as const,
        description: 'Heavy rain expected - consider rescheduling outdoor work'
      });
    }
    
    // Holiday markers
    const month = current.getMonth();
    const date = current.getDate();
    if ((month === 6 && date === 4) || (month === 11 && date === 25) || (month === 0 && date === 1)) {
      delays.push({
        id: `holiday-${current.getTime()}`,
        date: new Date(current),
        type: 'holiday' as const,
        severity: 'high' as const,
        description: 'Federal Holiday - No work scheduled'
      });
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return delays;
};

export const GanttWeatherMarkers = ({
  timelineStart,
  timelineEnd,
  viewMode
}: GanttWeatherMarkersProps) => {
  const weatherDelays = getWeatherDelays(timelineStart, timelineEnd);

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain size={8} className="text-blue-600" />;
      case 'snow': return <Snowflake size={8} className="text-blue-400" />;
      case 'storm': return <Cloud size={8} className="text-gray-600" />;
      case 'holiday': return <Sun size={8} className="text-yellow-600" />;
      default: return <Cloud size={8} className="text-gray-500" />;
    }
  };

  if (viewMode === 'months') return null; // Too granular for month view

  // Filter visible weather delays using standardized positioning
  const visibleDelays = weatherDelays.filter(delay => {
    const position = getMarkerPosition(delay.date, timelineStart, timelineEnd, viewMode);
    return position.isVisible;
  });

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0">
      {visibleDelays.map(delay => {
        const position = getMarkerPosition(delay.date, timelineStart, timelineEnd, viewMode);
        const verticalPos = getMarkerVerticalPosition('weather');
        const colorClass = getMarkerColor('weather', delay.severity);
        
        return (
          <Tooltip key={delay.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute pointer-events-auto"
                style={{ 
                  left: `${position.left}%`,
                  top: `${verticalPos.top}px`,
                  zIndex: verticalPos.zIndex
                }}
              >
                <div className={`w-3 h-3 rounded-full ${colorClass} flex items-center justify-center shadow-sm border-2 border-white`}>
                  {getWeatherIcon(delay.type)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 capitalize">{delay.type} Alert</div>
                <div className="text-sm text-slate-600">
                  {delay.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-slate-600">{delay.description}</div>
                <div className="text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getMarkerColor('weather', delay.severity)}`}></span>
                  {delay.severity} impact
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
