
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, Thermometer } from 'lucide-react';

export const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState({
    temperature: '--',
    condition: 'Loading...',
    humidity: '--',
    windSpeed: '--'
  });

  useEffect(() => {
    // This would typically fetch real weather data from an API
    // For now, showing placeholder until API is implemented
    const fetchWeather = () => {
      // Mock loading state - replace with actual API call
      setTimeout(() => {
        setWeatherData({
          temperature: 'N/A',
          condition: 'Weather data unavailable',
          humidity: 'N/A',
          windSpeed: 'N/A'
        });
      }, 1000);
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    if (condition.toLowerCase().includes('rain')) return CloudRain;
    if (condition.toLowerCase().includes('cloud')) return Cloud;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weatherData.condition);

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
              {weatherData.temperature}°F
            </p>
            <p className="text-sm text-slate-600">{weatherData.condition}</p>
          </div>
          <WeatherIcon className="h-8 w-8 text-slate-600" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Humidity</p>
            <p className="font-medium">{weatherData.humidity}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Wind</p>
            <p className="font-medium">{weatherData.windSpeed} mph</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
