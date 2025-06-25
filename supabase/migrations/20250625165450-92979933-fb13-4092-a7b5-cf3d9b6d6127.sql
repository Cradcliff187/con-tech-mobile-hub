
-- Enable real-time for projects table
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Enable real-time for stakeholders table
ALTER TABLE public.stakeholders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stakeholders;

-- Enable real-time for equipment table
ALTER TABLE public.equipment REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;

-- Enable real-time for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable real-time for documents table
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;

-- Enable real-time for resource_allocations table
ALTER TABLE public.resource_allocations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_allocations;

-- Enable real-time for stakeholder_assignments table
ALTER TABLE public.stakeholder_assignments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stakeholder_assignments;

-- Enable real-time for equipment_allocations table
ALTER TABLE public.equipment_allocations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment_allocations;

-- Enable real-time for maintenance_tasks table
ALTER TABLE public.maintenance_tasks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tasks;

-- Enable real-time for maintenance_schedules table
ALTER TABLE public.maintenance_schedules REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_schedules;
