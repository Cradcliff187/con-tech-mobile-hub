
import { Cloud, CloudRain, Snowflake, Sun } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WeatherDelayMarkersProps {
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

export const WeatherDelayMarkers = ({
  timelineStart,
  timelineEnd,
  viewMode
}: WeatherDelayMarkersProps) => {
  const weatherDelays = getWeatherDelays(timelineStart, timelineEnd);

  const getDelayPosition = (delayDate: Date) => {
    const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    const daysFromStart = Math.ceil((delayDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
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

  if (viewMode === 'months') return null; // Too granular for month view

  return (
    <div className="absolute top-12 bottom-0 left-0 right-0 pointer-events-none">
      {weatherDelays.map(delay => {
        const position = getDelayPosition(delay.date);
        
        return (
          <Tooltip key={delay.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute top-0 pointer-events-auto"
                style={{ left: `${position}%` }}
              >
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(delay.severity)} flex items-center justify-center shadow-sm border border-white`}>
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
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSeverityColor(delay.severity)}`}></span>
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
