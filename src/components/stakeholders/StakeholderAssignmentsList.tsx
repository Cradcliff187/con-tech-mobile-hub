
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectLink } from '@/components/common/ProjectLink';
import { CalendarDays, User, Briefcase } from 'lucide-react';

interface ProjectAssignment {
  id: string;
  project_id: string;
  role: string;
  status: string;
  start_date?: string;
  end_date?: string;
  total_hours?: number;
  hourly_rate?: number;
  total_cost?: number;
  project?: {
    id: string;
    name: string;
  };
}

interface TaskAssignment {
  id: string;
  assignment_role: string;
  status: string;
  assigned_at: string;
  task: {
    id: string;
    title: string;
    project_id: string;
    status: string;
    project?: {
      id: string;
      name: string;
    };
  };
}

export const StakeholderAssignmentsList = ({ stakeholderId }: { stakeholderId: string }) => {
  const [projectAssignments, setProjectAssignments] = useState<ProjectAssignment[]>([]);
  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, [stakeholderId]);

  const fetchAssignments = async () => {
    setLoading(true);
    
    try {
      // Fetch project-level assignments
      const { data: projectData, error: projectError } = await supabase
        .from('stakeholder_assignments')
        .select(`
          id,
          project_id,
          role,
          status,
          start_date,
          end_date,
          total_hours,
          hourly_rate,
          total_cost,
          project:projects(id, name)
        `)
        .eq('stakeholder_id', stakeholderId)
        .order('created_at', { ascending: false });

      if (projectError) {
        console.error('Error fetching project assignments:', projectError);
      } else {
        setProjectAssignments(projectData || []);
      }

      // Fetch task-level assignments
      const { data: taskData, error: taskError } = await supabase
        .from('task_stakeholder_assignments')
        .select(`
          id,
          assignment_role,
          status,
          assigned_at,
          task:tasks!inner(
            id,
            title,
            project_id,
            status,
            project:projects(id, name)
          )
        `)
        .eq('stakeholder_id', stakeholderId)
        .order('assigned_at', { ascending: false });

      if (taskError) {
        console.error('Error fetching task assignments:', taskError);
      } else {
        setTaskAssignments(taskData || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
    
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'assigned': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': case 'removed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasAnyAssignments = projectAssignments.length > 0 || taskAssignments.length > 0;

  return (
    <div className="space-y-6">
      {/* Project Assignments */}
      {projectAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Project Assignments ({projectAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectAssignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {assignment.project && (
                      <ProjectLink 
                        projectId={assignment.project.id} 
                        projectName={assignment.project.name}
                      />
                    )}
                    <Badge variant="outline" className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                  </div>
                  {assignment.role && (
                    <Badge variant="secondary">
                      {assignment.role}
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-600">
                  {assignment.start_date && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      Start: {new Date(assignment.start_date).toLocaleDateString()}
                    </div>
                  )}
                  {assignment.end_date && (
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      End: {new Date(assignment.end_date).toLocaleDateString()}
                    </div>
                  )}
                  {assignment.total_hours && (
                    <div>Hours: {assignment.total_hours}</div>
                  )}
                  {assignment.total_cost && (
                    <div>Cost: ${assignment.total_cost.toLocaleString()}</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Task Assignments */}
      {taskAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Task Assignments ({taskAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {taskAssignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">{assignment.task.title}</h4>
                    {assignment.task.project && (
                      <ProjectLink 
                        projectId={assignment.task.project.id} 
                        projectName={assignment.task.project.name}
                        className="text-sm"
                      />
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getStatusColor(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    <Badge variant="secondary">
                      {assignment.assignment_role}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                  </div>
                  <Badge variant="outline" className={getStatusColor(assignment.task.status)}>
                    Task: {assignment.task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!hasAnyAssignments && (
        <div className="text-center py-8">
          <User className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Assignments Found</h3>
          <p className="text-sm text-slate-500">
            This stakeholder doesn't have any project or task assignments yet.
          </p>
        </div>
      )}
    </div>
  );
};
