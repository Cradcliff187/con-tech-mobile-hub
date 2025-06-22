
/**
 * @deprecated This component has been replaced by CompactWeatherWidget
 * 
 * LEGACY COMPONENT - DO NOT USE
 * 
 * This file is kept for reference only. The WeatherWidget has been replaced
 * by CompactWeatherWidget which provides better integration with the dashboard
 * layout and shows weather impact on construction tasks.
 * 
 * Migration: Use CompactWeatherWidget instead
 * Location: src/components/dashboard/CompactWeatherWidget.tsx
 * 
 * Last used: Dashboard redesign (2025-06-22)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';

export const WeatherWidget = () => {
  const { weather, loading } = useWeatherData('default');

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return Sun;
    if (condition.toLowerCase().includes('rain')) return CloudRain;
    if (condition.toLowerCase().includes('cloud')) return Cloud;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weather?.condition);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Thermometer size={20} />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-200 rounded"></div>
              <div className="h-12 bg-slate-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Thermometer size={20} />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {weather?.temperature ? `${weather.temperature}°F` : '--°F'}
            </p>
            <p className="text-sm text-slate-600">
              {weather?.condition || 'No data available'}
            </p>
          </div>
          <WeatherIcon className="h-8 w-8 text-slate-600" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Humidity</p>
            <p className="font-medium">
              {weather?.humidity ? `${weather.humidity}%` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Wind</p>
            <p className="font-medium">
              {weather?.wind_speed ? `${weather.wind_speed} mph` : 'N/A'}
            </p>
          </div>
        </div>
        {!weather && (
          <div className="mt-4 text-xs text-slate-500 text-center">
            Weather data will be populated when available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
