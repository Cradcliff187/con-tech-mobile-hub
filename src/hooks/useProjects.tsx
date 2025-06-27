
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Subscription management references
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced fetch function
  const debouncedFetch = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      fetchProjects();
    }, 100);
  };

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:stakeholders(
            id,
            company_name,
            contact_person,
            stakeholder_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
        return;
      }

      // Map the data to ensure proper typing
      const mappedProjects = (data || []).map(project => ({
        ...project,
        phase: (project.phase || 'planning') as Project['phase'],
        unified_lifecycle_status: project.unified_lifecycle_status || undefined
      })) as Project[];

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error in fetchProjects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup subscription function
  const cleanupSubscription = () => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
        console.log('Projects subscription cleaned up');
      } catch (error) {
        console.error('Error cleaning up subscription:', error);
      }
      channelRef.current = null;
    }
    isSubscribedRef.current = false;
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      cleanupSubscription();
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      return;
    }

    try {
      // Create unique channel name with timestamp
      const channelName = `projects_${user.id}_${Date.now()}`;
      
      // Create subscription with unique channel name
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects'
          },
          (payload) => {
            console.log('Projects change detected:', payload);
            debouncedFetch();
          }
        )
        .subscribe((status) => {
          console.log('Projects subscription status:', status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Projects subscription error:', status);
            isSubscribedRef.current = false;
          }
        });

      channelRef.current = channel;

      // Initial fetch
      fetchProjects();

    } catch (error) {
      console.error('Error setting up projects subscription:', error);
      isSubscribedRef.current = false;
    }

    // Cleanup function
    return () => {
      cleanupSubscription();
    };
  }, [user?.id]); // Only depend on user?.id to prevent re-subscription loops

  const createProject = async (projectData: Partial<Project>) => {
    if (!user) return { error: 'User not authenticated' };

    if (!projectData.name) {
      return { error: 'Project name is required' };
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status || 'planning',
        phase: projectData.phase || 'planning',
        unified_lifecycle_status: projectData.unified_lifecycle_status || 'pre_construction',
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        location: projectData.location,
        progress: projectData.progress || 0,
        project_manager_id: user.id,
        client_id: projectData.client_id,
        street_address: projectData.street_address,
        city: projectData.city,
        state: projectData.state,
        zip_code: projectData.zip_code
      })
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .single();

    if (!error && data) {
      const newProject: Project = {
        ...data,
        phase: (data.phase || 'planning') as Project['phase'],
        unified_lifecycle_status: data.unified_lifecycle_status || undefined
      };
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Project created successfully"
      });
    } else {
      toast({
        title: "Error",
        description: error?.message || "Failed to create project",
        variant: "destructive"
      });
    }

    return { data, error };
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('projects')
      .update({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        phase: projectData.phase,
        unified_lifecycle_status: projectData.unified_lifecycle_status,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        budget: projectData.budget,
        location: projectData.location,
        progress: projectData.progress,
        client_id: projectData.client_id,
        street_address: projectData.street_address,
        city: projectData.city,
        state: projectData.state,
        zip_code: projectData.zip_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .single();

    if (!error && data) {
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Project updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: error?.message || "Failed to update project",
        variant: "destructive"
      });
    }

    return { data, error };
  };

  const deleteProject = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (!error) {
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete project",
        variant: "destructive"
      });
    }

    return { error };
  };

  const archiveProject = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('projects')
      .update({ 
        status: 'cancelled',
        unified_lifecycle_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .single();

    if (!error && data) {
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Project archived successfully"
      });
    } else {
      toast({
        title: "Error",
        description: error?.message || "Failed to archive project",
        variant: "destructive"
      });
    }

    return { data, error };
  };

  const unarchiveProject = async (id: string) => {
    if (!user) return { error: 'User not authenticated' };

    const { data, error } = await supabase
      .from('projects')
      .update({ 
        status: 'active',
        unified_lifecycle_status: 'construction',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        client:stakeholders(
          id,
          company_name,
          contact_person,
          stakeholder_type
        )
      `)
      .single();

    if (!error && data) {
      // Real-time subscription will handle state update
      toast({
        title: "Success",
        description: "Project restored successfully"
      });
    } else {
      toast({
        title: "Error",
        description: error?.message || "Failed to restore project",
        variant: "destructive"
      });
    }

    return { data, error };
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    // Backward compatibility function - triggers debounced fetch
    refetch: () => {
      console.log('refetch() called - triggering debounced fetch');
      debouncedFetch();
      return Promise.resolve();
    }
  };
};
