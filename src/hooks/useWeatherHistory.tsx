import { useState, useEffect } from 'react';
import { fetchWeatherHistory, WeatherHistoryRecord } from '@/services/weatherHistoryService';

export const useWeatherHistory = (city: string | null) => {
  const [data, setData] = useState<WeatherHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) {
      setData([]);
      return;
    }

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await fetchWeatherHistory(city);
        setData(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [city]);

  return { data, loading, error };
};