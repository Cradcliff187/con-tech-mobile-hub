
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, Sun, CloudRain, AlertTriangle, ExternalLink } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useTasks } from '@/hooks/useTasks';

// Weather-sensitive task categories for construction
const WEATHER_SENSITIVE_CATEGORIES = [
  'foundation',
  'concrete',
  'roofing',
  'siding',
  'painting',
  'landscaping',
  'excavation',
  'masonry'
];

const getWeatherIcon = (condition?: string) => {
  if (!condition) return Sun;
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) return CloudRain;
  if (lowerCondition.includes('cloud')) return Cloud;
  return Sun;
};

const getWeatherSeverity = (condition?: string, temperature?: number) => {
  if (!condition || !temperature) return 'normal';
  
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('rain') || lowerCondition.includes('storm')) return 'high';
  if (temperature < 35 || temperature > 95) return 'high';
  if (temperature < 45 || temperature > 85) return 'medium';
  return 'normal';
};

export const CompactWeatherWidget = () => {
  const { weather, loading } = useWeatherData('default');
  const { tasks } = useTasks();

  // Calculate weather-affected tasks
  const weatherAffectedTasks = useMemo(() => {
    if (!weather || !tasks.length) return 0;
    
    const activeTasks = tasks.filter(task => 
      task.status !== 'completed'
    );
    
    const affectedTasks = activeTasks.filter(task => {
      const category = task.category?.toLowerCase();
      return category && WEATHER_SENSITIVE_CATEGORIES.some(sensitiveCategory => 
        category.includes(sensitiveCategory)
      );
    });
    
    return affectedTasks.length;
  }, [weather, tasks]);

  // Don't render if loading or no weather data
  if (loading || !weather?.temperature) {
    return null;
  }

  const WeatherIcon = getWeatherIcon(weather.condition);
  const severity = getWeatherSeverity(weather.condition, weather.temperature);
  
  const severityColors = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  };

  const handleViewDetails = () => {
    // Open detailed weather information in a new tab or modal
    window.open('https://weather.com', '_blank');
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg border bg-white shadow-sm ${severityColors[severity]} max-w-sm`}>
      {/* Weather Display */}
      <div className="flex items-center gap-2">
        <WeatherIcon className="h-5 w-5" />
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-none">
            {weather.temperature}°F
          </span>
          <span className="text-xs text-slate-500 leading-none">
            {weather.condition || 'Clear'}
          </span>
        </div>
      </div>

      {/* Task Impact */}
      <div className="flex items-center gap-2">
        {weatherAffectedTasks > 0 && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-medium">
              {weatherAffectedTasks} tasks
            </span>
          </div>
        )}
        
        {/* View Details Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={handleViewDetails}
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
