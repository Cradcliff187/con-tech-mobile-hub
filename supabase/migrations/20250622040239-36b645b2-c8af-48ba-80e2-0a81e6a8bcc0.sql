
-- Migration: Move team_members data to stakeholder_assignments
-- Create migration log table for tracking issues and conflicts

CREATE TABLE IF NOT EXISTS public.migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation TEXT NOT NULL,
  source_table TEXT NOT NULL,
  source_id UUID,
  target_table TEXT,
  target_id UUID,
  issue_description TEXT NOT NULL,
  data_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create backup table for team_members data (for rollback capability)
CREATE TABLE IF NOT EXISTS public.team_members_backup AS 
SELECT * FROM public.team_members;

-- Main migration function
CREATE OR REPLACE FUNCTION public.migrate_team_members_to_stakeholder_assignments()
RETURNS TABLE(
  total_processed INTEGER,
  successful_migrations INTEGER,
  stakeholders_created INTEGER,
  errors_logged INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
  each_team_member RECORD;
  target_stakeholder_id UUID;
  target_project_id UUID;
  target_week_start_date DATE;
  calculated_total_cost DECIMAL;
  processed_count INTEGER := 0;
  success_count INTEGER := 0;
  created_stakeholders_count INTEGER := 0;
  error_count INTEGER := 0;
  new_assignment_id UUID;
BEGIN
  -- Log migration start
  INSERT INTO public.migration_log (operation, source_table, target_table, issue_description, data_snapshot)
  VALUES ('migration_start', 'team_members', 'stakeholder_assignments', 'Starting team_members migration', 
          jsonb_build_object('timestamp', NOW(), 'total_records', (SELECT COUNT(*) FROM team_members)));

  -- Process each team_member record
  FOR each_team_member IN (SELECT * FROM public.team_members) LOOP
    processed_count := processed_count + 1;
    
    BEGIN
      -- Get project_id and week_start_date from resource_allocations
      SELECT ra.project_id, ra.week_start_date 
      INTO target_project_id, target_week_start_date
      FROM public.resource_allocations ra 
      WHERE ra.id = each_team_member.allocation_id;
      
      -- Log if allocation_id doesn't exist
      IF target_project_id IS NULL THEN
        INSERT INTO public.migration_log (operation, source_table, source_id, issue_description, data_snapshot)
        VALUES ('validation_warning', 'team_members', each_team_member.id, 
                'No matching resource_allocation found for allocation_id', 
                row_to_json(each_team_member)::jsonb);
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Look for existing stakeholder with matching name and type 'employee'
      SELECT id INTO target_stakeholder_id
      FROM public.stakeholders 
      WHERE stakeholder_type = 'employee' 
        AND TRIM(LOWER(COALESCE(contact_person, ''))) = TRIM(LOWER(each_team_member.name))
      LIMIT 1;
      
      -- Create stakeholder if doesn't exist
      IF target_stakeholder_id IS NULL THEN
        INSERT INTO public.stakeholders (
          stakeholder_type,
          contact_person,
          status,
          created_at,
          updated_at
        ) VALUES (
          'employee',
          each_team_member.name,
          'active',
          each_team_member.created_at,
          NOW()
        ) RETURNING id INTO target_stakeholder_id;
        
        created_stakeholders_count := created_stakeholders_count + 1;
        
        -- Log stakeholder creation
        INSERT INTO public.migration_log (operation, source_table, source_id, target_table, target_id, issue_description, data_snapshot)
        VALUES ('stakeholder_created', 'team_members', each_team_member.id, 'stakeholders', target_stakeholder_id,
                'Created new employee stakeholder', 
                jsonb_build_object('name', each_team_member.name, 'stakeholder_id', target_stakeholder_id));
      END IF;
      
      -- Calculate total cost
      calculated_total_cost := COALESCE(each_team_member.hours_allocated, 0) * COALESCE(each_team_member.cost_per_hour, 0);
      
      -- Check for existing stakeholder_assignment to avoid duplicates
      IF EXISTS (
        SELECT 1 FROM public.stakeholder_assignments 
        WHERE stakeholder_id = target_stakeholder_id 
          AND project_id = target_project_id 
          AND COALESCE(role, '') = COALESCE(each_team_member.role, '')
          AND week_start_date = target_week_start_date
      ) THEN
        -- Log potential duplicate
        INSERT INTO public.migration_log (operation, source_table, source_id, issue_description, data_snapshot)
        VALUES ('duplicate_warning', 'team_members', each_team_member.id,
                'Similar stakeholder_assignment already exists', 
                jsonb_build_object('stakeholder_id', target_stakeholder_id, 'project_id', target_project_id, 'role', each_team_member.role));
        error_count := error_count + 1;
        CONTINUE;
      END IF;
      
      -- Create stakeholder_assignment record
      INSERT INTO public.stakeholder_assignments (
        stakeholder_id,
        project_id,
        role,
        hourly_rate,
        total_hours,
        total_cost,
        week_start_date,
        status,
        notes,
        created_at,
        updated_at
      ) VALUES (
        target_stakeholder_id,
        target_project_id,
        each_team_member.role,
        each_team_member.cost_per_hour,
        each_team_member.hours_allocated,
        calculated_total_cost,
        target_week_start_date,
        'assigned',
        CASE 
          WHEN each_team_member.tasks IS NOT NULL AND array_length(each_team_member.tasks, 1) > 0 
          THEN 'Migrated from team_members. Tasks: ' || array_to_string(each_team_member.tasks, ', ')
          ELSE 'Migrated from team_members'
        END,
        each_team_member.created_at,
        NOW()
      ) RETURNING id INTO new_assignment_id;
      
      success_count := success_count + 1;
      
      -- Log successful migration
      INSERT INTO public.migration_log (operation, source_table, source_id, target_table, target_id, issue_description, data_snapshot)
      VALUES ('migration_success', 'team_members', each_team_member.id, 'stakeholder_assignments', new_assignment_id,
              'Successfully migrated team_member to stakeholder_assignment',
              jsonb_build_object(
                'team_member_id', each_team_member.id,
                'assignment_id', new_assignment_id,
                'stakeholder_id', target_stakeholder_id,
                'project_id', target_project_id,
                'total_cost', calculated_total_cost
              ));
              
    EXCEPTION WHEN OTHERS THEN
      -- Log any unexpected errors
      error_count := error_count + 1;
      INSERT INTO public.migration_log (operation, source_table, source_id, issue_description, data_snapshot)
      VALUES ('migration_error', 'team_members', each_team_member.id,
              'Unexpected error: ' || SQLERRM,
              jsonb_build_object('error_detail', SQLERRM, 'team_member_data', row_to_json(each_team_member)));
    END;
  END LOOP;
  
  -- Log migration completion
  INSERT INTO public.migration_log (operation, source_table, target_table, issue_description, data_snapshot)
  VALUES ('migration_complete', 'team_members', 'stakeholder_assignments', 
          'Migration completed',
          jsonb_build_object(
            'total_processed', processed_count,
            'successful_migrations', success_count,
            'stakeholders_created', created_stakeholders_count,
            'errors_logged', error_count,
            'completion_time', NOW()
          ));
  
  -- Return summary statistics
  RETURN QUERY SELECT 
    processed_count,
    success_count,
    created_stakeholders_count,
    error_count;
END;
$$;

-- Execute the migration
SELECT * FROM public.migrate_team_members_to_stakeholder_assignments();

-- Create a view to easily check migration results
CREATE OR REPLACE VIEW public.migration_summary AS
SELECT 
  operation,
  COUNT(*) as count,
  MAX(created_at) as latest_occurrence
FROM public.migration_log 
GROUP BY operation
ORDER BY latest_occurrence DESC;

-- Show migration summary
SELECT * FROM public.migration_summary;

-- Show any errors or warnings
SELECT 
  operation,
  issue_description,
  data_snapshot,
  created_at
FROM public.migration_log 
WHERE operation IN ('validation_warning', 'duplicate_warning', 'migration_error')
ORDER BY created_at DESC;

-- Verification query: Compare counts
SELECT 
  'team_members' as source_table,
  COUNT(*) as record_count
FROM public.team_members
UNION ALL
SELECT 
  'stakeholder_assignments (migrated)' as source_table,
  COUNT(*) as record_count
FROM public.stakeholder_assignments sa
WHERE sa.notes LIKE '%Migrated from team_members%';

COMMENT ON TABLE public.migration_log IS 'Tracks data migration operations, conflicts, and issues during team_members to stakeholder_assignments migration';
COMMENT ON TABLE public.team_members_backup IS 'Backup of original team_members data before migration for rollback capability';
COMMENT ON FUNCTION public.migrate_team_members_to_stakeholder_assignments() IS 'Migrates team_members data to stakeholder_assignments with validation and logging';
