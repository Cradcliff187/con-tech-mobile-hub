-- CRM Database Migration: Add estimates, bids, contact interactions, and lead tracking
-- Created: 2025-01-06

-- Create new enum types for CRM functionality
CREATE TYPE public.estimate_status AS ENUM (
  'draft',
  'sent', 
  'viewed',
  'accepted',
  'declined',
  'expired'
);

CREATE TYPE public.bid_status AS ENUM (
  'pending',
  'submitted',
  'accepted', 
  'declined',
  'withdrawn'
);

CREATE TYPE public.lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal_sent',
  'negotiating',
  'won',
  'lost'
);

CREATE TYPE public.interaction_type AS ENUM (
  'call',
  'email', 
  'meeting',
  'site_visit',
  'proposal',
  'follow_up'
);

-- Create estimates table
CREATE TABLE public.estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL UNIQUE,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  labor_cost DECIMAL(12,2) DEFAULT 0,
  material_cost DECIMAL(12,2) DEFAULT 0,
  equipment_cost DECIMAL(12,2) DEFAULT 0,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  status public.estimate_status NOT NULL DEFAULT 'draft',
  valid_until DATE,
  terms_and_conditions TEXT,
  notes TEXT,
  sent_date DATE,
  viewed_date DATE,
  responded_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bids table  
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_id UUID REFERENCES public.estimates(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  bid_number TEXT NOT NULL UNIQUE,
  bid_amount DECIMAL(12,2) NOT NULL,
  competitor_count INTEGER DEFAULT 0,
  estimated_competition_range_low DECIMAL(12,2),
  estimated_competition_range_high DECIMAL(12,2),
  status public.bid_status NOT NULL DEFAULT 'pending',
  submission_date DATE,
  decision_date DATE,
  win_probability DECIMAL(3,2) CHECK (win_probability >= 0 AND win_probability <= 1),
  win_loss_reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_interactions table
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  interaction_type public.interaction_type NOT NULL,
  interaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  subject TEXT,
  notes TEXT,
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend stakeholders table with lead tracking fields
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS lead_source TEXT;
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS lead_status public.lead_status DEFAULT 'new';
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100);
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS first_contact_date DATE;
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS last_contact_date DATE;
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS next_followup_date DATE;
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS conversion_probability DECIMAL(3,2) CHECK (conversion_probability >= 0 AND conversion_probability <= 1);
ALTER TABLE public.stakeholders ADD COLUMN IF NOT EXISTS customer_lifetime_value DECIMAL(12,2) DEFAULT 0;

-- Create performance indexes
CREATE INDEX idx_estimates_stakeholder_id ON public.estimates(stakeholder_id);
CREATE INDEX idx_estimates_project_id ON public.estimates(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_estimates_status ON public.estimates(status);
CREATE INDEX idx_estimates_created_at ON public.estimates(created_at);
CREATE INDEX idx_estimates_valid_until ON public.estimates(valid_until) WHERE valid_until IS NOT NULL;

CREATE INDEX idx_bids_estimate_id ON public.bids(estimate_id) WHERE estimate_id IS NOT NULL;
CREATE INDEX idx_bids_project_id ON public.bids(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_submission_date ON public.bids(submission_date) WHERE submission_date IS NOT NULL;

CREATE INDEX idx_contact_interactions_stakeholder_id ON public.contact_interactions(stakeholder_id);
CREATE INDEX idx_contact_interactions_type ON public.contact_interactions(interaction_type);
CREATE INDEX idx_contact_interactions_date ON public.contact_interactions(interaction_date);
CREATE INDEX idx_contact_interactions_follow_up ON public.contact_interactions(follow_up_date) WHERE follow_up_required = true;

CREATE INDEX idx_stakeholders_lead_status ON public.stakeholders(lead_status) WHERE lead_status IS NOT NULL;
CREATE INDEX idx_stakeholders_next_followup ON public.stakeholders(next_followup_date) WHERE next_followup_date IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for estimates
CREATE POLICY "Company users can view estimates" ON public.estimates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

CREATE POLICY "Company users can manage estimates" ON public.estimates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

-- Create RLS policies for bids
CREATE POLICY "Company users can view bids" ON public.bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

CREATE POLICY "Company users can manage bids" ON public.bids
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

-- Create RLS policies for contact_interactions
CREATE POLICY "Company users can view contact interactions" ON public.contact_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

CREATE POLICY "Company users can manage contact interactions" ON public.contact_interactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_company_user = true 
      AND profiles.account_status = 'approved'
    )
  );

-- Create helper functions for CRM functionality
CREATE OR REPLACE FUNCTION public.generate_estimate_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  estimate_number TEXT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(estimate_number FROM 'EST-(\d+)') AS INTEGER)), 0) + 1 
  INTO next_number
  FROM public.estimates 
  WHERE estimate_number ~ '^EST-\d+$';
  
  -- Format as EST-00001
  estimate_number := 'EST-' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN estimate_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_bid_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  bid_number TEXT;
BEGIN
  -- Get the next number in sequence
  SELECT COALESCE(MAX(CAST(SUBSTRING(bid_number FROM 'BID-(\d+)') AS INTEGER)), 0) + 1 
  INTO next_number
  FROM public.bids 
  WHERE bid_number ~ '^BID-\d+$';
  
  -- Format as BID-00001
  bid_number := 'BID-' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN bid_number;
END;
$$;

-- Function to update stakeholder lead fields based on interactions
CREATE OR REPLACE FUNCTION public.update_stakeholder_lead_tracking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update last_contact_date and first_contact_date if needed
  UPDATE public.stakeholders 
  SET 
    last_contact_date = NEW.interaction_date,
    first_contact_date = CASE 
      WHEN first_contact_date IS NULL OR NEW.interaction_date < first_contact_date 
      THEN NEW.interaction_date 
      ELSE first_contact_date 
    END,
    updated_at = now()
  WHERE id = NEW.stakeholder_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update stakeholder lead tracking
CREATE TRIGGER update_stakeholder_lead_tracking_trigger
  AFTER INSERT ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stakeholder_lead_tracking();

-- Function to convert estimate to project
CREATE OR REPLACE FUNCTION public.convert_estimate_to_project(
  p_estimate_id UUID,
  p_project_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  estimate_record RECORD;
  new_project_id UUID;
BEGIN
  -- Get estimate details
  SELECT * INTO estimate_record
  FROM public.estimates
  WHERE id = p_estimate_id AND status = 'accepted';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Estimate not found or not accepted';
  END IF;
  
  -- Create new project
  INSERT INTO public.projects (
    name,
    description,
    budget,
    client_id,
    status,
    phase,
    created_at,
    updated_at
  ) VALUES (
    COALESCE(p_project_name, estimate_record.title),
    estimate_record.description,
    estimate_record.amount,
    estimate_record.stakeholder_id,
    'planning',
    'planning',
    now(),
    now()
  ) RETURNING id INTO new_project_id;
  
  -- Update estimate to link to project
  UPDATE public.estimates
  SET project_id = new_project_id, updated_at = now()
  WHERE id = p_estimate_id;
  
  RETURN new_project_id;
END;
$$;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW  
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_interactions_updated_at
  BEFORE UPDATE ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();