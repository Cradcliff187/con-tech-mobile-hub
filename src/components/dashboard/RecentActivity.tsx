
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { ActivityListSkeleton } from './skeletons/ActivityListSkeleton';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
  icon: any;
  type: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wrap hook usage in try-catch to prevent component crashes
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

        // Get recent tasks with assignee names
        const recentTasks = tasks
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3);

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

        // Get recent projects with project manager names
        const recentProjects = projects
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 2);

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

        // Sort all activities by time and return top 5
        setActivities(activityItems.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setError('Failed to load recent activity');
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
    return <ActivityListSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Clock size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorFallback 
            title="Activity Feed Unavailable"
            description={error}
            resetError={() => {
              setError(null);
              setLoading(true);
            }}
            className="max-w-none"
          />
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Clock size={20} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-500">No recent activity to display</p>
            <p className="text-sm text-slate-400 mt-2">Activity will appear here as you work on projects and tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Clock size={20} />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="bg-slate-100 p-2 rounded-full">
                  <Icon size={16} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User size={12} className="text-slate-400" />
                    <span className="text-xs text-slate-500">{activity.user}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{activity.time}</span>
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
