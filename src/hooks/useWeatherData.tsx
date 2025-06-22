
import { useState, useEffect } from 'react';

interface WeatherEvent {
  id: string;
  date: Date;
  type: 'rain' | 'snow' | 'storm' | 'holiday';
  severity: 'high' | 'moderate' | 'low';
  description: string;
}

interface CurrentWeather {
  temperature: number;
  condition: string;
  humidity: number;
  wind_speed: number;
}

// Overloaded hook - can return weather events or current weather
export function useWeatherData(startDate: Date, endDate: Date): { weatherEvents: WeatherEvent[]; loading: boolean };
export function useWeatherData(mode: 'default'): { weather: CurrentWeather | null; loading: boolean };
export function useWeatherData(startDateOrMode: Date | 'default', endDate?: Date) {
  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>([]);
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (startDateOrMode === 'default') {
        // Return current weather for widgets
        const mockWeather: CurrentWeather = {
          temperature: 72,
          condition: 'Partly Cloudy',
          humidity: 65,
          wind_speed: 8
        };
        
        setTimeout(() => {
          setWeather(mockWeather);
          setLoading(false);
        }, 500);
        return;
      }

      // Return weather events for timeline (existing logic)
      const startDate = startDateOrMode as Date;
      const events: WeatherEvent[] = [];
      const current = new Date(startDate);
      
      while (current <= endDate!) {
        const month = current.getMonth();
        const date = current.getDate();
        
        if ((month === 6 && date === 4)) {
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'Independence Day - Federal Holiday'
          });
        }
        
        if ((month === 11 && date === 25)) {
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'Christmas Day - Federal Holiday'
          });
        }
        
        if ((month === 0 && date === 1)) {
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'New Year\'s Day - Federal Holiday'
          });
        }

        if (month >= 5 && month <= 8) {
          if (current.getDay() === 3 && Math.random() > 0.85) {
            events.push({
              id: `storm-${current.getTime()}`,
              date: new Date(current),
              type: 'storm',
              severity: 'moderate',
              description: 'Thunderstorm warning - Consider rescheduling outdoor work'
            });
          }
        }
        
        if (month >= 11 || month <= 2) {
          if (Math.random() > 0.9) {
            events.push({
              id: `winter-${current.getTime()}`,
              date: new Date(current),
              type: 'snow',
              severity: 'moderate',
              description: 'Winter weather advisory - Check equipment readiness'
            });
          }
        }
        
        current.setDate(current.getDate() + 1);
      }
      
      setWeatherEvents(events);
      setLoading(false);
    };

    fetchData();
  }, [startDateOrMode, endDate]);

  if (startDateOrMode === 'default') {
    return { weather, loading };
  }

  return { weatherEvents, loading };
}
