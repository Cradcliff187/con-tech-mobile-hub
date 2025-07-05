import { supabase } from '@/integrations/supabase/client';

export interface WeatherHistoryRecord {
  id: string;
  city: string;
  temperature: number;
  wind_speed: number;
  precipitation: number;
  work_safe: boolean;
  created_at: string;
}

/**
 * Fetches the last 24 weather records for a specific city
 */
export const fetchWeatherHistory = async (city: string): Promise<WeatherHistoryRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('weather_logs')
      .select('*')
      .eq('city', city)
      .order('created_at', { ascending: false })
      .limit(24);

    if (error) {
      console.error('Error fetching weather history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Weather history service error:', error);
    throw error;
  }
};