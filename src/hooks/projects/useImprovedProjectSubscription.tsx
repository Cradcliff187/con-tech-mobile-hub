
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types/database';
import { subscriptionManager } from '@/services/subscription';

interface UseImprovedProjectSubscriptionProps {
  user: any;
  onProjectsUpdate: (projects: Project[]) => void;
}

export const useImprovedProjectSubscription = ({ 
  user, 
  onProjectsUpdate 
}: UseImprovedProjectSubscriptionProps) => {
  useEffect(() => {
    if (!user) return;

    console.log('Setting up projects real-time subscription');

    const handleProjectChange = async () => {
      try {
        // Fetch all projects with client relationships
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
          return;
        }

        // Map the data to ensure proper typing
        const mappedProjects = (data || []).map(project => ({
          ...project,
          phase: (project.phase || 'planning') as Project['phase'],
          unified_lifecycle_status: project.unified_lifecycle_status || undefined
        })) as Project[];

        onProjectsUpdate(mappedProjects);
      } catch (error) {
        console.error('Error in projects subscription handler:', error);
      }
    };

    // Set up subscription using the subscription manager
    const unsubscribe = subscriptionManager.subscribe(
      { table: 'projects' },
      handleProjectChange
    );

    // Initial fetch
    handleProjectChange();

    return () => {
      console.log('Cleaning up projects subscription');
      unsubscribe?.();
    };
  }, [user?.id, onProjectsUpdate]);
};
