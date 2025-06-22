
-- Create sample weather data for demo purposes
INSERT INTO public.weather_data (location, temperature, condition, humidity, wind_speed, last_updated)
VALUES 
  ('default', 72, 'Partly Cloudy', 65, 8, NOW()),
  ('site_a', 85, 'Sunny', 45, 12, NOW() - INTERVAL '1 hour'),
  ('site_b', 45, 'Heavy Rain', 90, 25, NOW() - INTERVAL '30 minutes'),
  ('site_c', 38, 'Snow', 85, 15, NOW() - INTERVAL '2 hours');

-- Update the default location with current timestamp to ensure it's the most recent
UPDATE public.weather_data 
SET last_updated = NOW() 
WHERE location = 'default';
