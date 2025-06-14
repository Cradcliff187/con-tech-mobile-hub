
-- Create stakeholder types enum
CREATE TYPE stakeholder_type AS ENUM ('subcontractor', 'employee', 'vendor');

-- Create stakeholder status enum  
CREATE TYPE stakeholder_status AS ENUM ('active', 'inactive', 'pending', 'suspended');

-- Main stakeholders table (complements existing profiles)
CREATE TABLE public.stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stakeholder_type stakeholder_type NOT NULL,
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  specialties TEXT[],
  crew_size INTEGER,
  status stakeholder_status DEFAULT 'active',
  insurance_expiry DATE,
  license_number TEXT,
  notes TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment certifications linking stakeholders to equipment
CREATE TABLE public.stakeholder_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  certification_name TEXT NOT NULL,
  issued_date DATE,
  expiry_date DATE,
  certification_number TEXT,
  issuing_authority TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholder assignments to projects and tasks
CREATE TABLE public.stakeholder_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  role TEXT,
  start_date DATE,
  end_date DATE,
  hourly_rate DECIMAL(10,2),
  status TEXT DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholder availability calendar
CREATE TABLE public.stakeholder_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  hours_available INTEGER DEFAULT 8,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stakeholder_id, date)
);

-- Stakeholder performance tracking
CREATE TABLE public.stakeholder_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.stakeholder_assignments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 10),
  timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 10),
  safety_score INTEGER CHECK (safety_score >= 1 AND safety_score <= 10),
  feedback TEXT,
  completed_tasks INTEGER DEFAULT 0,
  total_hours DECIMAL(10,2) DEFAULT 0,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  evaluator_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add stakeholder assignment field to existing tasks table
ALTER TABLE public.tasks ADD COLUMN assigned_stakeholder_id UUID REFERENCES public.stakeholders(id);

-- Add operator assignment to existing equipment table
ALTER TABLE public.equipment ADD COLUMN assigned_operator_id UUID REFERENCES public.stakeholders(id);

-- Enable RLS on all new tables
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stakeholders
CREATE POLICY "Users can view stakeholders in their projects" ON public.stakeholders FOR SELECT 
USING (
  id IN (
    SELECT sa.stakeholder_id FROM public.stakeholder_assignments sa
    WHERE sa.project_id IN (
      SELECT id FROM public.projects WHERE 
      client_id = auth.uid() OR 
      project_manager_id = auth.uid() OR 
      id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
    )
  ) OR 
  profile_id = auth.uid()
);

CREATE POLICY "Project managers can manage stakeholders" ON public.stakeholders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE project_manager_id = auth.uid()
  )
);

-- RLS Policies for stakeholder certifications
CREATE POLICY "Users can view certifications for accessible stakeholders" ON public.stakeholder_certifications FOR SELECT 
USING (
  stakeholder_id IN (
    SELECT id FROM public.stakeholders WHERE 
    id IN (
      SELECT sa.stakeholder_id FROM public.stakeholder_assignments sa
      WHERE sa.project_id IN (
        SELECT id FROM public.projects WHERE 
        client_id = auth.uid() OR 
        project_manager_id = auth.uid() OR 
        id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
      )
    ) OR profile_id = auth.uid()
  )
);

-- RLS Policies for assignments
CREATE POLICY "Users can view assignments in their projects" ON public.stakeholder_assignments FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

-- RLS Policies for availability
CREATE POLICY "Users can view stakeholder availability for their projects" ON public.stakeholder_availability FOR SELECT 
USING (
  stakeholder_id IN (
    SELECT sa.stakeholder_id FROM public.stakeholder_assignments sa
    WHERE sa.project_id IN (
      SELECT id FROM public.projects WHERE 
      client_id = auth.uid() OR 
      project_manager_id = auth.uid() OR 
      id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
    )
  )
);

-- RLS Policies for performance
CREATE POLICY "Users can view performance for accessible stakeholders" ON public.stakeholder_performance FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE 
    client_id = auth.uid() OR 
    project_manager_id = auth.uid() OR 
    id IN (SELECT project_id FROM public.tasks WHERE assignee_id = auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_stakeholders_type ON public.stakeholders(stakeholder_type);
CREATE INDEX idx_stakeholders_status ON public.stakeholders(status);
CREATE INDEX idx_stakeholder_assignments_project ON public.stakeholder_assignments(project_id);
CREATE INDEX idx_stakeholder_assignments_task ON public.stakeholder_assignments(task_id);
CREATE INDEX idx_stakeholder_certifications_type ON public.stakeholder_certifications(equipment_type);
CREATE INDEX idx_stakeholder_availability_date ON public.stakeholder_availability(date);

-- Update triggers for timestamps
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON public.stakeholders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stakeholder_assignments_updated_at BEFORE UPDATE ON public.stakeholder_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
