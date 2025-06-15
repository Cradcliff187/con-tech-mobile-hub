
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuickProjectCreate } from '@/components/common/QuickProjectCreate';
import { ProjectLink } from '@/components/common/ProjectLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types/database';

interface StakeholderProjectsProps {
  stakeholderId: string;
  stakeholderType: string;
}

export const StakeholderProjects = ({ stakeholderId, stakeholderType }: StakeholderProjectsProps) => {
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [stakeholderId]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, status, phase')
      .eq('client_id', stakeholderId)
      .order('created_at', { ascending: false });

    if (!error) {
      const mappedData = (data || []).map(p => ({
          ...p,
          status: p.status as Project['status'],
          phase: (p.phase || 'planning') as Project['phase']
      }));
      setProjects(mappedData);
    }
    setLoading(false);
  };

  if (stakeholderType !== 'client') return null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        <QuickProjectCreate 
          clientId={stakeholderId}
          buttonSize="sm"
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet for this client.</p>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="flex justify-between items-center">
                <ProjectLink 
                  projectId={project.id!} 
                  projectName={project.name}
                />
                <span className="text-xs text-slate-500 capitalize">
                  {project.phase?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
