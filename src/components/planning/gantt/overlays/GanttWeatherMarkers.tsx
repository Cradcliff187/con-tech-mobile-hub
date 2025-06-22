
import { Cloud, CloudRain, Snowflake, Sun } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getMarkerPosition, getMarkerVerticalPosition, getMarkerColor } from '../utils/overlayUtils';
import { useWeatherData } from '@/hooks/useWeatherData';

interface GanttWeatherMarkersProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttWeatherMarkers = ({
  timelineStart,
  timelineEnd,
  viewMode
}: GanttWeatherMarkersProps) => {
  const { weatherEvents, loading } = useWeatherData(timelineStart, timelineEnd);

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain size={8} className="text-blue-600" />;
      case 'snow': return <Snowflake size={8} className="text-blue-400" />;
      case 'storm': return <Cloud size={8} className="text-gray-600" />;
      case 'holiday': return <Sun size={8} className="text-yellow-600" />;
      default: return <Cloud size={8} className="text-gray-500" />;
    }
  };

  if (loading || viewMode === 'months') return null;

  // Filter visible weather events using standardized positioning
  const visibleEvents = weatherEvents.filter(event => {
    const position = getMarkerPosition(event.date, timelineStart, timelineEnd, viewMode);
    return position.isVisible;
  });

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0">
      {visibleEvents.map(event => {
        const position = getMarkerPosition(event.date, timelineStart, timelineEnd, viewMode);
        const verticalPos = getMarkerVerticalPosition('weather');
        const colorClass = getMarkerColor('weather', event.severity);
        
        return (
          <Tooltip key={event.id}>
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
                  {getWeatherIcon(event.type)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-800 capitalize">{event.type} Alert</div>
                <div className="text-sm text-slate-600">
                  {event.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-slate-600">{event.description}</div>
                <div className="text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getMarkerColor('weather', event.severity)}`}></span>
                  {event.severity} impact
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
