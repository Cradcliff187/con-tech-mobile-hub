
import { Cloud, CloudRain, Snowflake, Sun } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWeatherData } from '@/hooks/useWeatherData';

interface WeatherDelayMarkersProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const WeatherDelayMarkers = ({
  timelineStart,
  timelineEnd,
  viewMode
}: WeatherDelayMarkersProps) => {
  const { weatherEvents, loading } = useWeatherData(timelineStart, timelineEnd);

  const getDelayPosition = (eventDate: Date) => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((eventDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    return (daysFromStart / totalDays) * 100;
  };

  const getWeatherIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain size={10} className="text-blue-600" />;
      case 'snow': return <Snowflake size={10} className="text-blue-400" />;
      case 'storm': return <Cloud size={10} className="text-gray-600" />;
      case 'holiday': return <Sun size={10} className="text-yellow-600" />;
      default: return <Cloud size={10} className="text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'moderate': return 'bg-orange-500';
      case 'low': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || viewMode === 'months') return null;

  return (
    <div className="absolute top-12 bottom-0 left-0 right-0 pointer-events-none">
      {weatherEvents.map(event => {
        const position = getDelayPosition(event.date);
        
        return (
          <Tooltip key={event.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute top-0 pointer-events-auto"
                style={{ left: `${position}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)} flex items-center justify-center shadow-sm border border-white`}>
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
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(event.severity)}`}></span>
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
