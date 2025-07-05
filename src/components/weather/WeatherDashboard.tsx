import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, CloudSun } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  workSafe: boolean;
}

const cities = [
  { name: 'Erlanger, KY', latitude: 39.0167, longitude: -84.6008 },
  { name: 'Cincinnati, OH', latitude: 39.162, longitude: -84.457 },
  { name: 'Dayton, OH', latitude: 39.759, longitude: -84.192 },
  { name: 'Springfield, OH', latitude: 39.9242, longitude: -83.809 }
];

export const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const weatherPromises = cities.map(async (city) => {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,wind_speed_10m,precipitation&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weather for ${city.name}`);
        }
        
        const data = await response.json();
        const current = data.current;
        
        const temperature = Math.round(current.temperature_2m);
        const windSpeed = Math.round(current.wind_speed_10m);
        const precipitation = current.precipitation || 0;
        
        // Work safety calculation: Green if temp 20-95°F and wind < 30mph
        const workSafe = temperature >= 20 && temperature <= 95 && windSpeed < 30;
        
        return {
          city: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          temperature,
          windSpeed,
          precipitation,
          workSafe
        };
      });
      
      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && weatherData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Weather Conditions</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CloudSun className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Weather Conditions</h1>
        </div>
        {lastUpdated && (
          <div className="text-sm text-slate-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {weatherData.map((weather) => (
          <Card key={weather.city} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{weather.city}</CardTitle>
                <Badge 
                  variant={weather.workSafe ? "default" : "destructive"}
                  className={weather.workSafe ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {weather.workSafe ? "Work Safe" : "Caution"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.temperature}°F</div>
                    <div className="text-xs text-slate-600">Temperature</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.windSpeed}</div>
                    <div className="text-xs text-slate-600">mph</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.precipitation.toFixed(2)}</div>
                    <div className="text-xs text-slate-600">inches</div>
                  </div>
                </div>
              </div>
              
              {!weather.workSafe && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    {weather.temperature < 20 || weather.temperature > 95 
                      ? "Temperature outside safe range (20-95°F)" 
                      : "High wind conditions (≥30mph)"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center text-sm text-slate-500 mt-6">
        Weather data updates automatically every 30 minutes
      </div>
    </div>
  );
};