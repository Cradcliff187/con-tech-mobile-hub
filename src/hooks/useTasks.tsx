
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface UseTasksOptions {
  projectId?: string;
}

// Enhanced task type with project and stakeholder data
interface EnhancedTask extends Task {
  project?: {
    id: string;
    name: string;
    status?: string;
    phase?: string;
    unified_lifecycle_status?: string;
  };
  assignee?: {
    id: string;
    full_name?: string;
    email: string;
    avatar_url?: string;
  };
  assigned_stakeholder?: {
    id: string;
    contact_person?: string;
    company_name?: string;
    stakeholder_type: string;
  };
  stakeholder_assignments?: Array<{
    id: string;
    stakeholder: {
      id: string;
      contact_person?: string;
      company_name?: string;
      stakeholder_type: string;
    };
    assignment_role?: string;
  }>;
}

export const useTasks = (options: UseTasksOptions = {}) => {
  const [tasks, setTasks] = useState<EnhancedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { projectId } = options;

  // Memoize session readiness to prevent unnecessary re-computations
  const isSessionReady = useMemo(() => {
    const ready = !!user && !!profile;
    return ready;
  }, [user?.id, profile?.id]);

  // Enhanced fetch function with project and stakeholder joins
  const fetchTasks = useCallback(async () => {
    if (!isSessionReady) {
      setTasks([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:profiles!assignee_id(
            id,
            full_name,
            email,
            avatar_url
          ),
          project:projects!project_id(
            id,
            name,
            status,
            phase,
            unified_lifecycle_status
          ),
          assigned_stakeholder:stakeholders!assigned_stakeholder_id(
            id,
            contact_person,
            company_name,
            stakeholder_type
          ),
          stakeholder_assignments:task_stakeholder_assignments(
            id,
            assignment_role,
            status,
            stakeholder:stakeholders(
              id,
              contact_person,
              company_name,
              stakeholder_type
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch tasks: ${error.message}`);
      }

      const mappedTasks = (data || []).map(task => ({
        ...task,
        task_type: task.task_type === 'punch_list' ? 'punch_list' as const : 'regular' as const,
        // Filter to only show active assignments
        stakeholder_assignments: (task.stakeholder_assignments || []).filter(
          (assignment: any) => assignment.status === 'active'
        )
      })) as EnhancedTask[];

      setTasks(mappedTasks);
      return mappedTasks;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      console.error('Error fetching tasks:', errorMessage);
      setError(errorMessage);
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isSessionReady]);

  // Handle real-time updates using centralized subscription manager
  const handleTasksUpdate = useCallback((payload: any) => {
    console.log('Tasks change detected:', payload);
    fetchTasks();
  }, [fetchTasks]);

  // Use centralized subscription management for tasks
  const { isSubscribed } = useSubscription(
    'tasks',
    handleTasksUpdate,
    {
      userId: user?.id,
      enabled: isSessionReady
    }
  );

  // Also subscribe to assignment changes
  useSubscription(
    'task_stakeholder_assignments',
    handleTasksUpdate,
    {
      userId: user?.id,
      enabled: isSessionReady
    }
  );

  // Initial fetch when session is ready
  useEffect(() => {
    if (isSessionReady) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isSessionReady, fetchTasks]);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    if (!isSessionReady) return { error: 'Session not ready' };

    if (!taskData.title || !taskData.project_id) {
      return { error: 'Task title and project are required' };
    }

    try {
      // Create task first (without legacy assignment fields)
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          project_id: taskData.project_id,
          description: taskData.description,
          status: taskData.status || 'not-started',
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          category: taskData.category,
          estimated_hours: taskData.estimated_hours,
          actual_hours: taskData.actual_hours,
          progress: taskData.progress || 0,
          created_by: user!.id,
          assignee_id: taskData.assignee_id,
          task_type: taskData.task_type || 'regular',
          required_skills: taskData.required_skills,
          punch_list_category: taskData.punch_list_category,
          converted_from_task_id: taskData.converted_from_task_id,
          inspection_status: taskData.inspection_status
        })
        .select()
        .single();

      if (taskError) {
        throw new Error(`Failed to create task: ${taskError.message}`);
      }

      // Handle stakeholder assignments through junction table
      const assignmentPromises = [];
      
      // Handle single assignment (legacy support)
      if (taskData.assigned_stakeholder_id) {
        assignmentPromises.push(
          supabase
            .from('task_stakeholder_assignments')
            .insert({
              task_id: task.id,
              stakeholder_id: taskData.assigned_stakeholder_id,
              assignment_role: 'primary',
              assigned_by: user!.id,
              status: 'active'
            })
        );
      }

      // Handle multiple assignments (new system)
      if (taskData.assigned_stakeholder_ids && taskData.assigned_stakeholder_ids.length > 0) {
        const assignments = taskData.assigned_stakeholder_ids.map(stakeholderId => ({
          task_id: task.id,
          stakeholder_id: stakeholderId,
          assignment_role: 'assigned',
          assigned_by: user!.id,
          status: 'active'
        }));
        
        assignmentPromises.push(
          supabase
            .from('task_stakeholder_assignments')
            .insert(assignments)
        );
      }

      // Wait for all assignment operations to complete
      if (assignmentPromises.length > 0) {
        const assignmentResults = await Promise.all(assignmentPromises);
        for (const result of assignmentResults) {
          if (result.error) {
            console.warn('Assignment creation warning:', result.error.message);
          }
        }
      }

      // Real-time subscription will handle state update
      return { data: task, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      console.error('Error creating task:', err);
      return { error: errorMessage };
    }
  }, [user, isSessionReady]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!isSessionReady) return { error: 'Session not ready' };

    try {
      // Separate assignment updates from task updates
      const { assigned_stakeholder_id, assigned_stakeholder_ids, ...taskUpdates } = updates;

      // Update task data first
      const { data, error } = await supabase
        .from('tasks')
        .update(taskUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update task: ${error.message}`);
      }

      // Handle assignment updates if provided
      if (assigned_stakeholder_id !== undefined || assigned_stakeholder_ids !== undefined) {
        // Use a transaction-like approach: delete existing, then insert new
        
        // Step 1: Delete all existing active assignments for this task
        const { error: deleteError } = await supabase
          .from('task_stakeholder_assignments')
          .delete()
          .eq('task_id', id)
          .eq('status', 'active');

        if (deleteError) {
          console.error('Failed to delete existing assignments:', deleteError);
          throw new Error(`Failed to update assignments: ${deleteError.message}`);
        }

        // Step 2: Prepare new assignments
        const newAssignments = [];
        
        // Handle single assignment (legacy support)
        if (assigned_stakeholder_id) {
          newAssignments.push({
            task_id: id,
            stakeholder_id: assigned_stakeholder_id,
            assignment_role: 'primary',
            assigned_by: user!.id,
            status: 'active'
          });
        }

        // Handle multiple assignments
        if (assigned_stakeholder_ids && assigned_stakeholder_ids.length > 0) {
          const assignments = assigned_stakeholder_ids.map(stakeholderId => ({
            task_id: id,
            stakeholder_id: stakeholderId,
            assignment_role: 'assigned',
            assigned_by: user!.id,
            status: 'active'
          }));
          newAssignments.push(...assignments);
        }

        // Step 3: Insert new assignments (if any)
        if (newAssignments.length > 0) {
          const { error: insertError } = await supabase
            .from('task_stakeholder_assignments')
            .insert(newAssignments);

          if (insertError) {
            console.error('Failed to insert new assignments:', insertError);
            throw new Error(`Failed to create new assignments: ${insertError.message}`);
          }
        }
      }

      // Real-time subscription will handle state update
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      console.error('Error updating task:', err);
      return { error: errorMessage };
    }
  }, [user, isSessionReady]);

  // Filter tasks by project if specified
  const filteredTasks = useMemo(() => {
    if (projectId && projectId !== 'all') {
      return tasks.filter(task => task.project_id === projectId);
    }
    return tasks;
  }, [tasks, projectId]);

  const refetch = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: filteredTasks,
    loading: loading || !isSessionReady,
    error,
    createTask,
    updateTask,
    refetch
  };
};
