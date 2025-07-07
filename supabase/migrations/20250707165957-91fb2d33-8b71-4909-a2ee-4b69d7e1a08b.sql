-- Complete migration of legacy task assignments to junction table
-- This fixes the issue where assignments exist in tasks.assigned_stakeholder_id 
-- but code expects them in task_stakeholder_assignments table

-- First, migrate ALL existing single assignments to the junction table
INSERT INTO public.task_stakeholder_assignments (
  task_id,
  stakeholder_id,
  assignment_role,
  assigned_by,
  status,
  assigned_at
)
SELECT 
  t.id as task_id,
  t.assigned_stakeholder_id as stakeholder_id,
  'primary' as assignment_role,
  t.created_by as assigned_by,
  'active' as status,
  COALESCE(t.updated_at, t.created_at, NOW()) as assigned_at
FROM public.tasks t
WHERE t.assigned_stakeholder_id IS NOT NULL
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM public.task_stakeholder_assignments tsa 
    WHERE tsa.task_id = t.id 
      AND tsa.stakeholder_id = t.assigned_stakeholder_id
      AND tsa.status = 'active'
  );

-- Also migrate any multi-assignments from assigned_stakeholder_ids array
INSERT INTO public.task_stakeholder_assignments (
  task_id,
  stakeholder_id,
  assignment_role,
  assigned_by,
  status,
  assigned_at
)
SELECT 
  t.id as task_id,
  unnest(t.assigned_stakeholder_ids) as stakeholder_id,
  'assigned' as assignment_role,
  t.created_by as assigned_by,
  'active' as status,
  COALESCE(t.updated_at, t.created_at, NOW()) as assigned_at
FROM public.tasks t
WHERE t.assigned_stakeholder_ids IS NOT NULL 
  AND array_length(t.assigned_stakeholder_ids, 1) > 0
  AND NOT EXISTS (
    -- Don't create duplicates
    SELECT 1 FROM public.task_stakeholder_assignments tsa 
    WHERE tsa.task_id = t.id 
      AND tsa.stakeholder_id = ANY(t.assigned_stakeholder_ids)
      AND tsa.status = 'active'
  );

-- Log the migration results
INSERT INTO public.migration_log (
  operation,
  source_table,
  target_table,
  issue_description,
  data_snapshot
) VALUES (
  'task_assignment_migration',
  'tasks',
  'task_stakeholder_assignments',
  'Migrated legacy task assignments to junction table',
  jsonb_build_object(
    'legacy_single_assignments', (SELECT COUNT(*) FROM public.tasks WHERE assigned_stakeholder_id IS NOT NULL),
    'legacy_multi_assignments', (SELECT COUNT(*) FROM public.tasks WHERE assigned_stakeholder_ids IS NOT NULL AND array_length(assigned_stakeholder_ids, 1) > 0),
    'junction_assignments_after', (SELECT COUNT(*) FROM public.task_stakeholder_assignments WHERE status = 'active'),
    'migration_timestamp', NOW()
  )
);