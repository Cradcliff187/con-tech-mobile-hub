import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Wind, CloudSun } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { logWeatherData } from '@/services/weatherLogger';

interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  windGusts: number | null;
  precipitation: number;
  weatherCode: number;
  workSafe: boolean;
}

const cities = [
  { name: 'Erlanger, KY', latitude: 39.0167, longitude: -84.6008 },
  { name: 'Cincinnati, OH', latitude: 39.162, longitude: -84.457 },
  { name: 'Dayton, OH', latitude: 39.759, longitude: -84.192 },
  { name: 'Springfield, OH', latitude: 39.9242, longitude: -83.809 }
];

const getWeatherIcon = (weatherCode: number): string => {
  // WMO Weather interpretation codes
  if (weatherCode === 0) return '☀️'; // Clear sky
  if (weatherCode <= 3) return '⛅'; // Partly cloudy
  if (weatherCode <= 48) return '☁️'; // Overcast/foggy
  if (weatherCode <= 67) return '🌧️'; // Rain
  if (weatherCode <= 77) return '❄️'; // Snow
  if (weatherCode <= 82) return '🌦️'; // Showers
  if (weatherCode <= 99) return '⛈️'; // Thunderstorm
  return '☁️'; // Default
};

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
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_gusts_10m,precipitation,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch weather for ${city.name}`);
        }
        
        const data = await response.json();
        const current = data.current;
        
        const temperature = Math.round(current.temperature_2m);
        const feelsLike = Math.round(current.apparent_temperature);
        const windSpeed = Math.round(current.wind_speed_10m);
        const windGusts = current.wind_gusts_10m ? Math.round(current.wind_gusts_10m) : null;
        const precipitation = current.precipitation || 0;
        const weatherCode = current.weather_code || 0;
        
        // Work safety calculation: Green if temp 20-95°F and wind < 30mph
        const workSafe = temperature >= 20 && temperature <= 95 && windSpeed < 30;
        
        return {
          city: city.name,
          latitude: city.latitude,
          longitude: city.longitude,
          temperature,
          feelsLike,
          windSpeed,
          windGusts,
          precipitation,
          weatherCode,
          workSafe
        };
      });
      
      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
      setLastUpdated(new Date());
      
      // Log weather data to Supabase (async, non-blocking)
      logWeatherData(results).catch(error => {
        // Already handled in logger, but adding extra safety
        console.error('Weather logging failed:', error);
      });
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
          <Card 
            key={weather.city} 
            className={`relative overflow-hidden border-2 ${
              weather.workSafe 
                ? 'border-green-500 bg-green-50/50' 
                : 'border-red-500 bg-red-50/50'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getWeatherIcon(weather.weatherCode)}</span>
                  <CardTitle className="text-lg font-semibold">{weather.city}</CardTitle>
                </div>
                <Badge 
                  variant={weather.workSafe ? "default" : "destructive"}
                  className={weather.workSafe ? "bg-green-100 text-green-800 border-green-200" : ""}
                >
                  {weather.workSafe ? "Work Safe" : "Caution"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.temperature}°F</div>
                    <div className="text-xs text-slate-600">
                      Feels like {weather.feelsLike}°F
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.windSpeed}</div>
                    <div className="text-xs text-slate-600">
                      mph{weather.windGusts && weather.windGusts > weather.windSpeed + 5 && ` (gusts ${weather.windGusts})`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 col-span-2">
                  <CloudSun className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="text-2xl font-bold">{weather.precipitation.toFixed(1)}</div>
                    <div className="text-xs text-slate-600">inches precipitation</div>
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