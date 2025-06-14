
import { useState, useEffect } from 'react';
import { Clock, CheckSquare, User, AlertTriangle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ActivityLogEntry {
  id: string;
  entity_type: string;
  action: string;
  entity_id: string | null;
  project_id: string | null;
  user_id: string | null;
  details: any;
  created_at: string;
  user_profile?: {
    full_name: string | null;
    email: string;
  };
  project?: {
    name: string;
  };
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;

      try {
        console.log('Fetching recent activity...');
        
        // Try to fetch from activity_log table
        const { data: activityData, error: activityError } = await supabase
          .from('activity_log')
          .select(`
            *,
            user_profile:profiles!user_id(full_name, email),
            project:projects!project_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        console.log('Activity log query result:', { activityData, activityError });

        if (activityError) {
          console.error('Error fetching activity log:', activityError);
          // If activity_log doesn't exist or has no data, create sample entries from other tables
          await createSampleActivities();
        } else if (activityData && activityData.length > 0) {
          setActivities(activityData);
        } else {
          // No activity data exists, create some based on existing data
          await createSampleActivities();
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    const createSampleActivities = async () => {
      try {
        // Get recent tasks, projects, and user actions to create activity entries
        const { data: recentTasks } = await supabase
          .from('tasks')
          .select('*, project:projects(name)')
          .order('updated_at', { ascending: false })
          .limit(5);

        const { data: recentProjects } = await supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(3);

        const sampleActivities: ActivityLogEntry[] = [];

        // Create activity entries from recent tasks
        recentTasks?.forEach((task, index) => {
          sampleActivities.push({
            id: `task-${task.id}`,
            entity_type: 'task',
            action: task.status === 'completed' ? 'completed' : 'updated',
            entity_id: task.id,
            project_id: task.project_id,
            user_id: task.assignee_id || user.id,
            details: { task_title: task.title },
            created_at: task.updated_at,
            user_profile: { full_name: 'Team Member', email: user.email },
            project: task.project || { name: 'Project' }
          });
        });

        // Create activity entries from recent projects
        recentProjects?.forEach((project, index) => {
          sampleActivities.push({
            id: `project-${project.id}`,
            entity_type: 'project',
            action: 'updated',
            entity_id: project.id,
            project_id: project.id,
            user_id: project.project_manager_id || user.id,
            details: { project_name: project.name },
            created_at: project.updated_at,
            user_profile: { full_name: 'Project Manager', email: user.email },
            project: { name: project.name }
          });
        });

        // Sort by date and take most recent
        sampleActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setActivities(sampleActivities.slice(0, 6));
      } catch (error) {
        console.error('Error creating sample activities:', error);
        setActivities([]);
      }
    };

    fetchRecentActivity();
  }, [user]);

  const getActivityIcon = (entityType: string, action: string) => {
    switch (entityType) {
      case 'task':
        return action === 'completed' ? CheckSquare : Clock;
      case 'project':
        return Database;
      case 'user':
        return User;
      default:
        return AlertTriangle;
    }
  };

  const getActivityColor = (entityType: string, action: string) => {
    switch (entityType) {
      case 'task':
        return action === 'completed' ? 'text-green-600' : 'text-blue-600';
      case 'project':
        return 'text-purple-600';
      case 'user':
        return 'text-blue-600';
      default:
        return 'text-orange-600';
    }
  };

  const formatActivityMessage = (activity: ActivityLogEntry) => {
    const taskTitle = activity.details?.task_title;
    const projectName = activity.project?.name || 'Unknown Project';
    const userName = activity.user_profile?.full_name || 'Team Member';

    switch (activity.entity_type) {
      case 'task':
        if (activity.action === 'completed') {
          return `${taskTitle || 'Task'} completed`;
        }
        return `${taskTitle || 'Task'} updated`;
      case 'project':
        return `Project ${projectName} updated`;
      case 'user':
        return `${userName} ${activity.action}`;
      default:
        return `${activity.entity_type} ${activity.action}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading activity...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <Database size={48} className="mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No Recent Activity</h3>
            <p className="text-slate-500">Start creating projects and tasks to see activity here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.entity_type, activity.action);
              const color = getActivityColor(activity.entity_type, activity.action);
              
              return (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium">
                        {formatActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {activity.project?.name || 'General Activity'}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock size={14} className="mr-1" />
                      {formatTimeAgo(activity.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
