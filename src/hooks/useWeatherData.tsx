
import { useState, useEffect } from 'react';

interface WeatherEvent {
  id: string;
  date: Date;
  type: 'rain' | 'snow' | 'storm' | 'holiday';
  severity: 'high' | 'moderate' | 'low';
  description: string;
}

export const useWeatherData = (startDate: Date, endDate: Date) => {
  const [weatherEvents, setWeatherEvents] = useState<WeatherEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      
      // For now, we'll generate some realistic weather events based on date patterns
      // In production, this would call a real weather API
      const events: WeatherEvent[] = [];
      const current = new Date(startDate);
      
      while (current <= endDate) {
        // Add holiday markers for known dates
        const month = current.getMonth();
        const date = current.getDate();
        
        if ((month === 6 && date === 4)) { // July 4th
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'Independence Day - Federal Holiday'
          });
        }
        
        if ((month === 11 && date === 25)) { // Christmas
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'Christmas Day - Federal Holiday'
          });
        }
        
        if ((month === 0 && date === 1)) { // New Year's
          events.push({
            id: `holiday-${current.getTime()}`,
            date: new Date(current),
            type: 'holiday',
            severity: 'high',
            description: 'New Year\'s Day - Federal Holiday'
          });
        }

        // Add some seasonal weather patterns (simplified)
        if (month >= 5 && month <= 8) { // Summer months
          // Occasional summer storms
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
        
        if (month >= 11 || month <= 2) { // Winter months
          // Occasional winter weather
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

    fetchWeatherData();
  }, [startDate, endDate]);

  return { weatherEvents, loading };
};
