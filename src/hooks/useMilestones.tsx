
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export const useMilestones = (projectId?: string) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMilestones = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, we'll derive milestones from project data and key tasks
      // This is a temporary solution until we create a proper milestones table
      let query = supabase
        .from('projects')
        .select('id, name, start_date, end_date, status, progress');

      if (projectId) {
        query = query.eq('id', projectId);
      }

      const { data: projects, error } = await query;

      if (error) {
        console.error('Error fetching projects for milestones:', error);
        setMilestones([]);
      } else {
        // Create synthetic milestones based on project data
        const syntheticMilestones: Milestone[] = (projects || []).flatMap(project => [
          {
            id: `${project.id}-start`,
            project_id: project.id,
            title: `${project.name} - Project Start`,
            description: 'Project kick-off and initial setup',
            due_date: project.start_date || new Date().toISOString(),
            status: project.start_date && new Date(project.start_date) <= new Date() ? 'completed' : 'pending' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${project.id}-midpoint`,
            project_id: project.id,
            title: `${project.name} - Mid-point Review`,
            description: 'Project progress review and adjustments',
            due_date: project.end_date ? new Date(new Date(project.start_date || Date.now()).getTime() + 
              (new Date(project.end_date).getTime() - new Date(project.start_date || Date.now()).getTime()) / 2).toISOString() 
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: (project.progress || 0) >= 50 ? 'completed' : 'in-progress' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: `${project.id}-end`,
            project_id: project.id,
            title: `${project.name} - Project Completion`,
            description: 'Final deliverables and project closure',
            due_date: project.end_date || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: project.status === 'completed' ? 'completed' : 
                   project.end_date && new Date(project.end_date) < new Date() ? 'overdue' : 'pending' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

        setMilestones(syntheticMilestones);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [user, projectId]);

  return {
    milestones,
    loading,
    refetch: fetchMilestones
  };
};
