-- Create company_settings table for storing monthly CRM goals
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company settings
CREATE POLICY "Admin users can manage company settings" 
ON public.company_settings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Company users can view company settings" 
ON public.company_settings 
FOR SELECT 
USING (is_approved_company_user());

-- Insert default CRM goals settings
INSERT INTO public.company_settings (setting_key, setting_value, description) VALUES
('crm_monthly_goals', jsonb_build_object(
  'revenue_target', 100000,
  'leads_target', 25,
  'estimates_target', 15,
  'bids_target', 10,
  'conversion_rate_target', 20
), 'Monthly CRM goals and targets for pipeline management');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();