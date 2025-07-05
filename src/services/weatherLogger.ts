import { supabase } from '@/integrations/supabase/client';

interface WeatherLogData {
  city: string;
  temperature: number;
  wind_speed: number;
  precipitation: number;
  work_safe: boolean;
}

interface WeatherData {
  city: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  workSafe: boolean;
}

/**
 * Logs weather data to Supabase for historical tracking
 * Non-blocking operation - errors are logged but don't throw
 */
export const logWeatherData = async (weatherData: WeatherData[]): Promise<void> => {
  try {
    // Validate input data
    if (!weatherData || weatherData.length === 0) {
      console.warn('Weather logger: No data provided to log');
      return;
    }

    // Transform data to match database schema
    const weatherLogs: WeatherLogData[] = weatherData.map(data => ({
      city: data.city?.trim() || 'Unknown',
      temperature: Number(data.temperature) || 0,
      wind_speed: Number(data.windSpeed) || 0,
      precipitation: Number(data.precipitation) || 0,
      work_safe: Boolean(data.workSafe)
    }));

    // Filter out invalid entries
    const validLogs = weatherLogs.filter(log => 
      log.city !== 'Unknown' &&
      !isNaN(log.temperature) &&
      !isNaN(log.wind_speed) &&
      !isNaN(log.precipitation)
    );

    if (validLogs.length === 0) {
      console.warn('Weather logger: No valid weather data to log');
      return;
    }

    // Insert data to Supabase
    const { error } = await supabase
      .from('weather_logs')
      .insert(validLogs);

    if (error) {
      console.error('Weather logger: Failed to save weather data:', error.message);
    } else {
      console.log(`Weather logger: Successfully logged ${validLogs.length} weather entries`);
    }

  } catch (error) {
    console.error('Weather logger: Unexpected error:', error instanceof Error ? error.message : 'Unknown error');
  }
};