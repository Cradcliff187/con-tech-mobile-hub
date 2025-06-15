
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, FileText, CheckSquare } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  time: string;
  icon: any;
  type: string;
}

export const RecentActivity = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const activityItems: ActivityItem[] = [];

        // Get recent tasks with assignee names
        const recentTasks = tasks
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 3);

        for (const task of recentTasks) {
          let userName = 'Unknown User';
          
          if (task.assignee_id) {
            const { data: assignee } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', task.assignee_id)
              .single();
            
            userName = assignee?.full_name || assignee?.email || 'Unknown User';
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
            const { data: manager } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', project.project_manager_id)
              .single();
            
            managerName = manager?.full_name || manager?.email || 'Unknown Manager';
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
        setActivities([]);
      }
    };

    if (tasks.length > 0 || projects.length > 0) {
      fetchRecentActivities();
    }
  }, [tasks, projects, stakeholders]);

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
