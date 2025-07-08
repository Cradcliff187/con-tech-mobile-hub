-- Fix ambiguous column reference errors in estimate and bid number generation functions
-- Problem: Local variable names conflict with table column names causing ambiguous references
-- Solution: Rename local variables and add table prefixes for clarity

-- Fix generate_estimate_number() function
CREATE OR REPLACE FUNCTION public.generate_estimate_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  new_estimate_number TEXT;  -- Renamed from 'estimate_number' to avoid column name conflict
BEGIN
  -- Get the next number in sequence
  -- Added table prefix 'estimates.' for clarity
  SELECT COALESCE(MAX(CAST(SUBSTRING(estimates.estimate_number FROM 'EST-(\d+)') AS INTEGER)), 0) + 1 
  INTO next_number
  FROM public.estimates 
  WHERE estimates.estimate_number ~ '^EST-\d+$';
  
  -- Format as EST-00001
  new_estimate_number := 'EST-' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN new_estimate_number;
END;
$function$;

-- Fix generate_bid_number() function  
CREATE OR REPLACE FUNCTION public.generate_bid_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  next_number INTEGER;
  new_bid_number TEXT;  -- Renamed from 'bid_number' to avoid column name conflict
BEGIN
  -- Get the next number in sequence
  -- Added table prefix 'bids.' for clarity
  SELECT COALESCE(MAX(CAST(SUBSTRING(bids.bid_number FROM 'BID-(\d+)') AS INTEGER)), 0) + 1 
  INTO next_number
  FROM public.bids 
  WHERE bids.bid_number ~ '^BID-\d+$';
  
  -- Format as BID-00001
  new_bid_number := 'BID-' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN new_bid_number;
END;
$function$;