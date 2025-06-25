
import { useEffect, useRef } from 'react';
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
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      // Clean up existing subscription if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastUserIdRef.current = null;
      return;
    }

    // Skip if same user and subscription already exists
    if (lastUserIdRef.current === user.id && unsubscribeRef.current) {
      return;
    }

    // Clean up existing subscription before creating new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

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

    unsubscribeRef.current = unsubscribe;
    lastUserIdRef.current = user.id;

    // Initial fetch
    handleProjectChange();

    return () => {
      console.log('Cleaning up projects subscription');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      lastUserIdRef.current = null;
    };
  }, [user?.id]); // Only depend on user ID, not the callback

  // Handle callback changes without re-subscribing
  useEffect(() => {
    // No need to re-subscribe, just ensure we have the latest callback
    // The subscription manager handles this internally
  }, [onProjectsUpdate]);
};
