
-- Create resource allocations table
CREATE TABLE IF NOT EXISTS public.resource_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  team_name text NOT NULL,
  total_budget numeric DEFAULT 0,
  total_used numeric DEFAULT 0,
  week_start_date date NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create team members table for resource allocations
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  allocation_id uuid REFERENCES public.resource_allocations(id) ON DELETE CASCADE,
  stakeholder_id uuid REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  hours_allocated integer DEFAULT 0,
  hours_used integer DEFAULT 0,
  cost_per_hour numeric DEFAULT 0,
  availability integer DEFAULT 100,
  tasks text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create weather data table for weather widget
CREATE TABLE IF NOT EXISTS public.weather_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  location text NOT NULL,
  temperature integer,
  condition text,
  humidity integer,
  wind_speed integer,
  forecast jsonb, -- Store 5-day forecast as JSON
  last_updated timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create task updates table for detailed task tracking
CREATE TABLE IF NOT EXISTS public.task_updates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  message text NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  author_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add triggers for updated_at columns
CREATE OR REPLACE TRIGGER update_resource_allocations_updated_at
  BEFORE UPDATE ON public.resource_allocations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resource_allocations_project_id ON public.resource_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_week_start ON public.resource_allocations(week_start_date);
CREATE INDEX IF NOT EXISTS idx_team_members_allocation_id ON public.team_members(allocation_id);
CREATE INDEX IF NOT EXISTS idx_team_members_stakeholder_id ON public.team_members(stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_task_id ON public.task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_weather_data_location ON public.weather_data(location);
