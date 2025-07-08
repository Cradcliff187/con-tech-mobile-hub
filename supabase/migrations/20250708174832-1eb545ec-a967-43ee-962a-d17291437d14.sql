-- Enable replica identity FULL for stakeholders table to ensure real-time updates work properly
ALTER TABLE public.stakeholders REPLICA IDENTITY FULL;