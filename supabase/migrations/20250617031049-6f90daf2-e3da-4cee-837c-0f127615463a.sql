
-- Phase 1: Create Core Maintenance Tables

-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'routine' CHECK (task_type IN ('routine', 'repair', 'inspection', 'calibration', 'safety_check')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue')),
  scheduled_date date NOT NULL,
  estimated_hours integer DEFAULT 4,
  actual_hours integer,
  assigned_to_stakeholder_id uuid REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  assigned_to_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id),
  completed_by uuid REFERENCES public.profiles(id),
  completed_at timestamp with time zone,
  notes text,
  checklist_items jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create maintenance_history table for tracking all maintenance activities
CREATE TABLE IF NOT EXISTS public.maintenance_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  maintenance_task_id uuid REFERENCES public.maintenance_tasks(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('task_created', 'task_started', 'task_completed', 'task_cancelled', 'status_changed', 'assignment_changed')),
  description text NOT NULL,
  performed_by uuid REFERENCES public.profiles(id),
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Create maintenance_schedules table for recurring maintenance patterns
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE CASCADE NOT NULL,
  schedule_name text NOT NULL,
  task_type text NOT NULL DEFAULT 'routine',
  description text,
  frequency_type text NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'hours_based', 'usage_based')),
  frequency_value integer NOT NULL DEFAULT 1,
  estimated_hours integer DEFAULT 4,
  is_active boolean DEFAULT true,
  last_generated_date date,
  next_due_date date,
  auto_assign_to_stakeholder_id uuid REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  checklist_template jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_equipment_id ON public.maintenance_tasks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON public.maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_scheduled_date ON public.maintenance_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_assigned_stakeholder ON public.maintenance_tasks(assigned_to_stakeholder_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment_id ON public.maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_task_id ON public.maintenance_history(maintenance_task_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_equipment_id ON public.maintenance_schedules(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due ON public.maintenance_schedules(next_due_date);

-- Add triggers for updated_at columns
CREATE OR REPLACE TRIGGER update_maintenance_tasks_updated_at
  BEFORE UPDATE ON public.maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically generate maintenance tasks from schedules
CREATE OR REPLACE FUNCTION public.generate_maintenance_tasks_from_schedules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When equipment.maintenance_due is updated, check if we need to create maintenance tasks
  IF NEW.maintenance_due IS NOT NULL AND (OLD.maintenance_due IS NULL OR OLD.maintenance_due != NEW.maintenance_due) THEN
    -- Create a routine maintenance task if one doesn't exist for this date
    INSERT INTO public.maintenance_tasks (
      equipment_id,
      title,
      description,
      task_type,
      priority,
      scheduled_date,
      estimated_hours
    )
    SELECT 
      NEW.id,
      'Routine Maintenance - ' || NEW.name,
      'Scheduled routine maintenance for ' || NEW.name,
      'routine',
      CASE 
        WHEN NEW.maintenance_due < CURRENT_DATE THEN 'critical'
        WHEN NEW.maintenance_due <= CURRENT_DATE + INTERVAL '7 days' THEN 'high'
        ELSE 'medium'
      END,
      NEW.maintenance_due,
      4
    WHERE NOT EXISTS (
      SELECT 1 FROM public.maintenance_tasks 
      WHERE equipment_id = NEW.id 
      AND scheduled_date = NEW.maintenance_due 
      AND status IN ('scheduled', 'in_progress')
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate maintenance tasks when equipment.maintenance_due is set
CREATE OR REPLACE TRIGGER trigger_generate_maintenance_tasks
  AFTER UPDATE OF maintenance_due ON public.equipment
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_maintenance_tasks_from_schedules();

-- Create function to update equipment status when maintenance is completed
CREATE OR REPLACE FUNCTION public.update_equipment_after_maintenance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When a maintenance task is completed, update equipment
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update equipment maintenance_due based on task type
    UPDATE public.equipment 
    SET 
      maintenance_due = CASE 
        WHEN NEW.task_type = 'routine' THEN NEW.scheduled_date + INTERVAL '90 days'
        WHEN NEW.task_type = 'inspection' THEN NEW.scheduled_date + INTERVAL '180 days'
        ELSE maintenance_due
      END,
      status = CASE 
        WHEN status = 'maintenance' THEN 'available'
        ELSE status
      END,
      updated_at = now()
    WHERE id = NEW.equipment_id;
    
    -- Create history record
    INSERT INTO public.maintenance_history (
      equipment_id,
      maintenance_task_id,
      action_type,
      description,
      performed_by,
      details
    ) VALUES (
      NEW.equipment_id,
      NEW.id,
      'task_completed',
      'Maintenance task completed: ' || NEW.title,
      NEW.completed_by,
      jsonb_build_object(
        'task_type', NEW.task_type,
        'actual_hours', NEW.actual_hours,
        'scheduled_date', NEW.scheduled_date,
        'completed_at', NEW.completed_at
      )
    );
  END IF;
  
  -- When a maintenance task is started, update equipment status if needed
  IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
    UPDATE public.equipment 
    SET status = 'maintenance', updated_at = now()
    WHERE id = NEW.equipment_id AND status = 'available';
    
    -- Create history record
    INSERT INTO public.maintenance_history (
      equipment_id,
      maintenance_task_id,
      action_type,
      description,
      performed_by
    ) VALUES (
      NEW.equipment_id,
      NEW.id,
      'task_started',
      'Maintenance task started: ' || NEW.title,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to update equipment when maintenance tasks change status
CREATE OR REPLACE TRIGGER trigger_update_equipment_after_maintenance
  AFTER UPDATE OF status ON public.maintenance_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_equipment_after_maintenance();

-- Create function to check for overdue maintenance tasks
CREATE OR REPLACE FUNCTION public.mark_overdue_maintenance_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark tasks as overdue if they're past their scheduled date
  UPDATE public.maintenance_tasks 
  SET status = 'overdue', updated_at = now()
  WHERE status = 'scheduled' 
  AND scheduled_date < CURRENT_DATE;
  
  -- Create history records for newly overdue tasks
  INSERT INTO public.maintenance_history (
    equipment_id,
    maintenance_task_id,
    action_type,
    description
  )
  SELECT 
    mt.equipment_id,
    mt.id,
    'status_changed',
    'Task marked as overdue: ' || mt.title
  FROM public.maintenance_tasks mt
  WHERE mt.status = 'overdue' 
  AND mt.scheduled_date < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM public.maintenance_history mh 
    WHERE mh.maintenance_task_id = mt.id 
    AND mh.action_type = 'status_changed'
    AND mh.description LIKE 'Task marked as overdue%'
    AND mh.created_at::date = CURRENT_DATE
  );
END;
$$;
