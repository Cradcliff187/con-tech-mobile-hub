-- Remove unused weather_data table and related policies
-- This table contained mock data and is no longer needed with real weather integration

-- Drop RLS policies for weather_data table if they exist
DROP POLICY IF EXISTS "Company users can view weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Company users can update weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Company users can insert weather data" ON public.weather_data;
DROP POLICY IF EXISTS "Company users can delete weather data" ON public.weather_data;

-- Drop the weather_data table
DROP TABLE IF EXISTS public.weather_data;