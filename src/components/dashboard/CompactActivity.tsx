import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, User, FileText, CheckSquare } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
  icon: any;
  type: string;
}

interface CompactActivityProps {
  onViewAll?: () => void;
  className?: string;
}

export const CompactActivity = ({ onViewAll, className = '' }: CompactActivityProps) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrap hook usage in try-catch to prevent component crashes (same as RecentActivity)
  let tasks: any[] = [];
  let projects: any[] = [];
  let stakeholders: any[] = [];
  let tasksLoading = true;
  let projectsLoading = true;

  try {
    const tasksResult = useTasks();
    tasks = tasksResult.tasks || [];
    tasksLoading = tasksResult.loading;
  } catch (taskError) {
    console.error('Error in useTasks hook:', taskError);
    tasksLoading = false;
  }

  try {
    const projectsResult = useProjects();
    projects = projectsResult.projects || [];
    projectsLoading = projectsResult.loading;
  } catch (projectError) {
    console.error('Error in useProjects hook:', projectError);
    projectsLoading = false;
  }

  try {
    const stakeholdersResult = useStakeholders();
    stakeholders = stakeholdersResult.stakeholders || [];
  } catch (stakeholderError) {
    console.error('Error in useStakeholders hook:', stakeholderError);
  }

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (tasksLoading || projectsLoading) return;
      
      try {
        setLoading(true);
        setError(null);

        const activityItems: ActivityItem[] = [];

        // Get recent tasks with assignee names (same logic as RecentActivity)
        const recentTasks = tasks
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 2); // Reduced for compact view

        for (const task of recentTasks) {
          let userName = 'Unknown User';
          
          if (task.assignee_id) {
            try {
              const { data: assignee } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', task.assignee_id)
                .single();
              
              userName = assignee?.full_name || assignee?.email || 'Unknown User';
            } catch (assigneeError) {
              console.warn('Could not fetch assignee for task:', task.id);
            }
          } else if (task.assigned_stakeholder_id) {
            const stakeholder = stakeholders.find(s => s.id === task.assigned_stakeholder_id);
            userName = stakeholder?.contact_person || stakeholder?.company_name || 'Unknown Stakeholder';
          }

          activityItems.push({
            id: task.id,
            action: `Task "${task.title}" was ${task.status === 'completed' ? 'completed' : 'updated'}`,
            user: userName,
            time: new Date(task.updated_at).toLocaleDateString(),
            icon: CheckSquare,
            type: 'task'
          });
        }

        // Get recent projects with project manager names (same logic as RecentActivity)
        const recentProjects = projects
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 1); // Reduced for compact view

        for (const project of recentProjects) {
          let managerName = 'Unknown Manager';
          
          if (project.project_manager_id) {
            try {
              const { data: manager } = await supabase
                .from('profiles')
                .select('full_name, email')
                .eq('id', project.project_manager_id)
                .single();
              
              managerName = manager?.full_name || manager?.email || 'Unknown Manager';
            } catch (managerError) {
              console.warn('Could not fetch manager for project:', project.id);
            }
          }

          activityItems.push({
            id: project.id,
            action: `Project "${project.name}" was updated`,
            user: managerName,
            time: new Date(project.updated_at).toLocaleDateString(),
            icon: FileText,
            type: 'project'
          });
        }

        // Sort all activities by time and return top 3
        setActivities(activityItems.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setError('Failed to load');
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (!tasksLoading && !projectsLoading && (tasks.length > 0 || projects.length > 0)) {
      fetchRecentActivities();
    } else if (!tasksLoading && !projectsLoading) {
      setLoading(false);
    }
  }, [tasks, projects, stakeholders, tasksLoading, projectsLoading]);

  if (loading || tasksLoading || projectsLoading) {
    return (
      <Card className={`sticky top-6 h-fit ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`sticky top-6 h-fit ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
            <Activity size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className={`sticky top-6 h-fit ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
            <Activity size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`sticky top-6 h-fit ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-sm">
            <Activity size={20} />
            Recent Activity
          </CardTitle>
          {onViewAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-xs text-blue-600 hover:text-blue-800 h-auto p-0"
            >
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-2">
                <div className="bg-slate-100 p-1.5 rounded-full flex-shrink-0">
                  <Icon size={14} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-800 line-clamp-2 leading-snug">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-slate-500 truncate">
                      {activity.user}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};