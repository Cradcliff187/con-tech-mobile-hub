
-- Create safety and budget tracking tables migration
-- Migration: Add safety and budget tracking tables

-- Create safety incidents table
CREATE TABLE public.safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),
  description TEXT NOT NULL,
  reported_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  corrective_actions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety compliance table
CREATE TABLE public.safety_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  compliance_type TEXT NOT NULL CHECK (compliance_type IN ('general', 'ppe', 'training', 'equipment', 'documentation')),
  compliance_rate INTEGER NOT NULL CHECK (compliance_rate >= 0 AND compliance_rate <= 100),
  last_audit_date DATE,
  next_audit_date DATE,
  auditor_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety toolbox talks table
CREATE TABLE public.safety_toolbox_talks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  completed_count INTEGER DEFAULT 0 CHECK (completed_count >= 0),
  total_required INTEGER DEFAULT 0 CHECK (total_required >= 0),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  topic TEXT,
  conducted_by UUID REFERENCES public.profiles(id),
  attendance_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, month, year)
);

-- Create budget tracking table
CREATE TABLE public.budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  spent_amount DECIMAL(12,2) DEFAULT 0 CHECK (spent_amount >= 0),
  committed_amount DECIMAL(12,2) DEFAULT 0 CHECK (committed_amount >= 0),
  projected_total DECIMAL(12,2) DEFAULT 0 CHECK (projected_total >= 0),
  variance_amount DECIMAL(12,2) DEFAULT 0,
  variance_percentage DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget line items table
CREATE TABLE public.budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('labor', 'materials', 'equipment', 'permits', 'subcontractor', 'overhead', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  vendor TEXT,
  invoice_number TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_safety_incidents_project_id ON public.safety_incidents(project_id);
CREATE INDEX idx_safety_incidents_date ON public.safety_incidents(incident_date);
CREATE INDEX idx_safety_compliance_project_id ON public.safety_compliance(project_id);
CREATE INDEX idx_safety_toolbox_talks_project_id ON public.safety_toolbox_talks(project_id);
CREATE INDEX idx_safety_toolbox_talks_period ON public.safety_toolbox_talks(year, month);
CREATE INDEX idx_budget_tracking_project_id ON public.budget_tracking(project_id);
CREATE INDEX idx_budget_line_items_project_id ON public.budget_line_items(project_id);
CREATE INDEX idx_budget_line_items_date ON public.budget_line_items(date);
CREATE INDEX idx_budget_line_items_category ON public.budget_line_items(category);

-- Enable Row Level Security
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_toolbox_talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for safety_incidents
CREATE POLICY "Company users can view safety incidents" ON public.safety_incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
    )
  );

CREATE POLICY "Project managers and admins can manage safety incidents" ON public.safety_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

-- RLS Policies for safety_compliance
CREATE POLICY "Company users can view safety compliance" ON public.safety_compliance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
    )
  );

CREATE POLICY "Project managers and admins can manage safety compliance" ON public.safety_compliance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

-- RLS Policies for safety_toolbox_talks
CREATE POLICY "Company users can view toolbox talks" ON public.safety_toolbox_talks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
    )
  );

CREATE POLICY "Project managers and admins can manage toolbox talks" ON public.safety_toolbox_talks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

-- RLS Policies for budget_tracking
CREATE POLICY "Project managers and admins can view budget tracking" ON public.budget_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

CREATE POLICY "Project managers and admins can manage budget tracking" ON public.budget_tracking
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

-- RLS Policies for budget_line_items
CREATE POLICY "Project managers and admins can view budget line items" ON public.budget_line_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

CREATE POLICY "Project managers and admins can manage budget line items" ON public.budget_line_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id 
      AND public.user_can_access_project(p.id)
      AND public.is_project_manager_or_admin()
    )
  );

-- Add update triggers for timestamp columns
CREATE TRIGGER update_safety_incidents_updated_at 
  BEFORE UPDATE ON public.safety_incidents 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_compliance_updated_at 
  BEFORE UPDATE ON public.safety_compliance 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_safety_toolbox_talks_updated_at 
  BEFORE UPDATE ON public.safety_toolbox_talks 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budget_line_items_updated_at 
  BEFORE UPDATE ON public.budget_line_items 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper functions for calculating metrics
CREATE OR REPLACE FUNCTION public.calculate_days_without_incident(p_project_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_incident_date DATE;
  days_count INTEGER;
BEGIN
  SELECT MAX(incident_date) INTO last_incident_date
  FROM public.safety_incidents
  WHERE project_id = p_project_id;
  
  IF last_incident_date IS NULL THEN
    -- No incidents recorded, calculate from project start
    SELECT COALESCE(CURRENT_DATE - start_date, 0) INTO days_count
    FROM public.projects
    WHERE id = p_project_id;
  ELSE
    days_count := CURRENT_DATE - last_incident_date;
  END IF;
  
  RETURN COALESCE(days_count, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_budget_variance(p_project_id UUID)
RETURNS TABLE(variance_amount DECIMAL, variance_percentage DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_budget DECIMAL;
  current_spending DECIMAL;
  v_variance_amount DECIMAL;
  v_variance_percentage DECIMAL;
BEGIN
  -- Get project budget
  SELECT budget INTO project_budget
  FROM public.projects
  WHERE id = p_project_id;
  
  -- Get current spending from budget tracking
  SELECT spent_amount INTO current_spending
  FROM public.budget_tracking
  WHERE project_id = p_project_id
  ORDER BY last_updated DESC
  LIMIT 1;
  
  IF project_budget IS NULL OR current_spending IS NULL THEN
    RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL;
    RETURN;
  END IF;
  
  v_variance_amount := project_budget - current_spending;
  v_variance_percentage := CASE 
    WHEN project_budget > 0 THEN (v_variance_amount / project_budget) * 100
    ELSE 0
  END;
  
  RETURN QUERY SELECT v_variance_amount, v_variance_percentage;
END;
$$;
