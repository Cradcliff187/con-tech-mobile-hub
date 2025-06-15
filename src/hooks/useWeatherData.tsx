
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WeatherData {
  id: string;
  location: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  wind_speed?: number;
  forecast?: any;
  last_updated: string;
}

export const useWeatherData = (location: string = 'default') => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .eq('location', location)
        .order('last_updated', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching weather data:', error);
      } else {
        setWeather(data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const updateWeather = async (weatherData: Partial<WeatherData>) => {
    const { data, error } = await supabase
      .from('weather_data')
      .upsert({
        location,
        temperature: weatherData.temperature,
        condition: weatherData.condition,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed,
        forecast: weatherData.forecast,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && data) {
      setWeather(data);
    }

    return { data, error };
  };

  return {
    weather,
    loading,
    updateWeather,
    refetch: fetchWeather
  };
};
