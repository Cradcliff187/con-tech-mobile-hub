
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
    
    try {
      // Get unique project IDs from multiple sources
      const projectIds = new Set<string>();
      
      // 1. Projects where stakeholder is the client
      const { data: clientProjects } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', stakeholderId);
      
      clientProjects?.forEach(p => projectIds.add(p.id));
      
      // 2. Projects from stakeholder assignments
      const { data: assignmentProjects } = await supabase
        .from('stakeholder_assignments')
        .select('project_id')
        .eq('stakeholder_id', stakeholderId)
        .not('project_id', 'is', null);
      
      assignmentProjects?.forEach(a => projectIds.add(a.project_id!));
      
      // 3. Projects from task assignments (via tasks)
      const { data: taskAssignments } = await supabase
        .from('task_stakeholder_assignments')
        .select(`
          task:tasks!inner(project_id)
        `)
        .eq('stakeholder_id', stakeholderId);
      
      taskAssignments?.forEach(ta => {
        if (ta.task?.project_id) {
          projectIds.add(ta.task.project_id);
        }
      });
      
      // Fetch full project details for all unique project IDs
      if (projectIds.size > 0) {
        const { data: projectDetails, error } = await supabase
          .from('projects')
          .select('id, name, status, phase')
          .in('id', Array.from(projectIds))
          .order('created_at', { ascending: false });
        
        if (!error && projectDetails) {
          const mappedData = projectDetails.map(p => ({
            ...p,
            status: p.status as Project['status'],
            phase: (p.phase || 'planning') as Project['phase']
          }));
          setProjects(mappedData);
        } else {
          console.error('Error fetching project details:', error);
          setProjects([]);
        }
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching stakeholder projects:', error);
      setProjects([]);
    }
    
    setLoading(false);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        {stakeholderType === 'client' && (
          <QuickProjectCreate 
            clientId={stakeholderId}
            buttonSize="sm"
          />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-sm text-slate-500">
            No projects found for this {stakeholderType}.
          </p>
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
