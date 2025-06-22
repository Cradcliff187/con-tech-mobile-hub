
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stakeholder {
  id: string;
  stakeholder_type: string;
  contact_person: string;
  company_name?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  status: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export const useStakeholders = (projectId?: string) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        let query = supabase
          .from('stakeholders')
          .select('*')
          .eq('status', 'active')
          .order('contact_person');

        if (projectId) {
          // Get stakeholders assigned to this project
          const { data: assignments } = await supabase
            .from('stakeholder_assignments')
            .select('stakeholder_id')
            .eq('project_id', projectId);
          
          const stakeholderIds = assignments?.map(a => a.stakeholder_id) || [];
          if (stakeholderIds.length > 0) {
            query = query.in('id', stakeholderIds);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        setStakeholders(data || []);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
        setStakeholders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakeholders();
  }, [projectId]);

  return { stakeholders, loading };
};
