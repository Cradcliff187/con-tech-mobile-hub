import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudRain, Cloud, Sun, Shield, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useSafetyMetrics } from '@/hooks/useSafetyMetrics';
import { useTasks } from '@/hooks/useTasks';

// Weather-sensitive task categories for construction (preserved from CompactWeatherWidget)
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

export const InlineWeatherSafety = () => {
  const navigate = useNavigate();
  const { weather, loading: weatherLoading } = useWeatherData('default');
  const { tasks } = useTasks();
  const { metrics: safetyMetrics, loading: safetyLoading } = useSafetyMetrics();

  // Calculate weather-affected tasks (preserved logic from CompactWeatherWidget)
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

  // Calculate overall system status
  const systemStatus = useMemo(() => {
    if (weatherLoading || safetyLoading) return { status: 'loading', color: 'secondary' };
    
    const weatherSeverity = weather ? getWeatherSeverity(weather.condition, weather.temperature) : 'normal';
    const daysWithoutIncident = safetyMetrics?.daysWithoutIncident;
    
    // Determine overall status based on weather and safety
    if (weatherSeverity === 'high' || (daysWithoutIncident !== null && daysWithoutIncident < 7)) {
      return { status: 'Active Alerts', color: 'destructive' };
    }
    
    if (weatherSeverity === 'medium' || (daysWithoutIncident !== null && daysWithoutIncident < 30)) {
      return { status: 'Monitor Conditions', color: 'secondary' };
    }
    
    return { status: 'All Systems Good', color: 'default' };
  }, [weather, safetyMetrics, weatherLoading, safetyLoading]);

  const handleWeatherClick = () => {
    navigate('/?section=weather');
  };

  // Don't render if both are loading
  if (weatherLoading && safetyLoading) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 bg-slate-200 rounded"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-slate-200 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
        </div>
        <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
      </div>
    );
  }

  const WeatherIcon = weather ? getWeatherIcon(weather.condition) : Sun;
  const weatherSeverity = weather ? getWeatherSeverity(weather.condition, weather.temperature) : 'normal';
  
  const severityColors = {
    normal: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-orange-600 bg-orange-50 border-orange-200',
    high: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm ${severityColors[weatherSeverity]}`}>
      {/* Weather Section (Left) */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={handleWeatherClick}>
        <WeatherIcon className="h-5 w-5 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">
              {weather?.temperature || '--'}°F
            </span>
            <span className="text-xs text-slate-500 leading-none">
              {weather?.condition || 'Loading'}
            </span>
          </div>
          {weatherAffectedTasks > 0 && (
            <div className="flex items-center gap-1 ml-2">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-medium">
                {weatherAffectedTasks} tasks
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Safety Section (Center) */}
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-slate-600 flex-shrink-0" />
        <div className="text-sm">
          {safetyLoading ? (
            <span className="text-slate-500">Loading...</span>
          ) : safetyMetrics?.daysWithoutIncident !== null ? (
            <span className="font-medium">
              {safetyMetrics.daysWithoutIncident} days safe
            </span>
          ) : (
            <span className="text-slate-500">No data</span>
          )}
        </div>
      </div>

      {/* Status Badge (Right) */}
      <Badge 
        variant={systemStatus.color as any}
        className="flex-shrink-0"
      >
        {systemStatus.status}
      </Badge>
    </div>
  );
};