-- Add gross_margin field to estimates table with automatic calculation
-- Calculate margin as: (amount - total_costs) / amount * 100
-- Total costs = labor_cost + material_cost + equipment_cost

-- Add gross_margin column to estimates table
ALTER TABLE public.estimates ADD COLUMN gross_margin DECIMAL(5,2);

-- Add CHECK constraint for margin range validation
ALTER TABLE public.estimates ADD CONSTRAINT check_gross_margin_range 
  CHECK (gross_margin IS NULL OR (gross_margin >= -100 AND gross_margin <= 100));

-- Create function to calculate estimate gross margin
CREATE OR REPLACE FUNCTION public.calculate_estimate_gross_margin()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  total_costs DECIMAL(12,2);
BEGIN
  -- Calculate total costs (treating NULL as 0)
  total_costs := COALESCE(NEW.labor_cost, 0) + COALESCE(NEW.material_cost, 0) + COALESCE(NEW.equipment_cost, 0);
  
  -- Calculate gross margin percentage
  IF NEW.amount IS NULL OR NEW.amount = 0 THEN
    NEW.gross_margin := NULL;
  ELSE
    NEW.gross_margin := ROUND(((NEW.amount - total_costs) / NEW.amount * 100), 2);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically calculate gross margin
CREATE TRIGGER calculate_estimate_gross_margin_trigger
  BEFORE INSERT OR UPDATE OF amount, labor_cost, material_cost, equipment_cost
  ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_estimate_gross_margin();

-- Update existing records with calculated gross margin
UPDATE public.estimates 
SET gross_margin = CASE 
  WHEN amount IS NULL OR amount = 0 THEN NULL
  ELSE ROUND(((amount - (COALESCE(labor_cost, 0) + COALESCE(material_cost, 0) + COALESCE(equipment_cost, 0))) / amount * 100), 2)
END;

-- Add index for performance on gross_margin queries
CREATE INDEX idx_estimates_gross_margin ON public.estimates(gross_margin) 
WHERE gross_margin IS NOT NULL;