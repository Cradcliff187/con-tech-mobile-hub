
-- Add structured address fields to stakeholders table
ALTER TABLE public.stakeholders 
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Add structured address fields to projects table  
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state VARCHAR(2),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
