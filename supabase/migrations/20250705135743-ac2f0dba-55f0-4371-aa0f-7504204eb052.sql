-- Create weather_logs table for tracking weather conditions over time
CREATE TABLE IF NOT EXISTS public.weather_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  wind_speed NUMERIC NOT NULL,
  precipitation NUMERIC NOT NULL,
  work_safe BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weather_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for company users
CREATE POLICY "Company users can insert weather logs" 
ON public.weather_logs 
FOR INSERT 
WITH CHECK (is_approved_company_user());

CREATE POLICY "Company users can view weather logs" 
ON public.weather_logs 
FOR SELECT 
USING (is_approved_company_user());

-- Create index for efficient querying by city and timestamp
CREATE INDEX idx_weather_logs_city_created_at ON public.weather_logs (city, created_at DESC);
CREATE INDEX idx_weather_logs_work_safe ON public.weather_logs (work_safe, created_at DESC);