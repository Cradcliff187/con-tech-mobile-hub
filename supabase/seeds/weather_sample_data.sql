
-- Sample weather data for demo purposes
-- This file documents the weather data added for testing the CompactWeatherWidget

-- Insert sample weather data with varied conditions to demonstrate different severity levels
INSERT INTO public.weather_data (location, temperature, condition, humidity, wind_speed, last_updated)
VALUES 
  -- Default location with normal construction-friendly weather
  ('default', 72, 'Partly Cloudy', 65, 8, NOW()),
  
  -- Site A with hot weather (potential heat stress concerns)
  ('site_a', 85, 'Sunny', 45, 12, NOW() - INTERVAL '1 hour'),
  
  -- Site B with severe weather (high impact on construction tasks)
  ('site_b', 45, 'Heavy Rain', 90, 25, NOW() - INTERVAL '30 minutes'),
  
  -- Site C with cold weather and snow (concrete/paint restrictions)
  ('site_c', 38, 'Snow', 85, 15, NOW() - INTERVAL '2 hours');

-- Ensure the default location has the most recent timestamp
UPDATE public.weather_data 
SET last_updated = NOW() 
WHERE location = 'default';

-- Weather conditions and their construction impact:
-- - Normal (70-80°F): Green indicator, minimal task impact
-- - Hot (>85°F): Yellow/Orange indicator, heat stress precautions
-- - Cold (<45°F): Yellow/Orange indicator, concrete/material limitations
-- - Precipitation: Red indicator, high impact on outdoor tasks
-- - High winds (>20mph): Red indicator, crane/scaffolding restrictions

-- Future enhancement: Replace with real weather API integration
-- Weather-sensitive task categories currently tracked:
-- foundation, concrete, roofing, siding, painting, landscaping, excavation, masonry
