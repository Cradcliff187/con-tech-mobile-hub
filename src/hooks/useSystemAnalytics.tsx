
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemAnalytics {
  totalUsers: number;
  activeToday: number;
  avgResponseTime: number;
  dbQueriesPerHour: number;
  userActivityData: Array<{
    name: string;
    logins: number;
    activeUsers: number;
  }>;
  performanceData: Array<{
    name: string;
    responseTime: number;
    queries: number;
  }>;
  featureUsageData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const useSystemAnalytics = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics>({
    totalUsers: 0,
    activeToday: 0,
    avgResponseTime: 0,
    dbQueriesPerHour: 0,
    userActivityData: [],
    performanceData: [],
    featureUsageData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get users active today (with last_login)
        const today = new Date().toISOString().split('T')[0];
        const { count: activeToday } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('last_login', `${today}T00:00:00Z`);

        // Get recent activity log for performance metrics
        const { data: recentActivity } = await supabase
          .from('activity_log')
          .select('created_at, action')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(1000);

        // Calculate weekly activity data
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          
          const dayActivity = recentActivity?.filter(activity => {
            const activityDate = new Date(activity.created_at);
            return activityDate >= dayStart && activityDate <= dayEnd;
          }) || [];

          return {
            name: dayName,
            logins: dayActivity.filter(a => a.action === 'login').length,
            activeUsers: new Set(dayActivity.map(a => a.user_id)).size
          };
        });

        // Calculate hourly performance data (last 24 hours)
        const hourlyData = Array.from({ length: 6 }, (_, i) => {
          const hour = i * 4; // Every 4 hours
          const hourActivity = recentActivity?.filter(activity => {
            const activityDate = new Date(activity.created_at);
            const activityHour = activityDate.getHours();
            return Math.floor(activityHour / 4) === i;
          }) || [];

          return {
            name: `${hour.toString().padStart(2, '0')}:00`,
            responseTime: Math.min(100 + hourActivity.length * 2, 300), // Simulated response time based on activity
            queries: hourActivity.length * 10 // Estimated queries
          };
        });

        // Get feature usage from activity log
        const { data: allActivity } = await supabase
          .from('activity_log')
          .select('action, entity_type')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // Categorize actions into features
        const featureMap: Record<string, string> = {
          'task_create': 'Task Management',
          'task_update': 'Task Management',
          'task_delete': 'Task Management',
          'project_create': 'Project Planning',
          'project_update': 'Project Planning',
          'stakeholder_assign': 'Resource Allocation',
          'message_send': 'Communication',
          'document_upload': 'Document Management'
        };

        const featureUsage: Record<string, number> = {};
        allActivity?.forEach(activity => {
          const feature = featureMap[activity.action] || 'Other';
          featureUsage[feature] = (featureUsage[feature] || 0) + 1;
        });

        const totalUsage = Object.values(featureUsage).reduce((sum, count) => sum + count, 0);
        const featureUsageData = Object.entries(featureUsage).map(([name, count], index) => ({
          name,
          value: totalUsage > 0 ? Math.round((count / totalUsage) * 100) : 0,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
        }));

        setAnalytics({
          totalUsers: totalUsers || 0,
          activeToday: activeToday || 0,
          avgResponseTime: Math.round(weekData.reduce((sum, day) => sum + day.activeUsers, 0) * 2.5 + 120),
          dbQueriesPerHour: Math.round((recentActivity?.length || 0) * 1.5),
          userActivityData: weekData,
          performanceData: hourlyData,
          featureUsageData
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return { analytics, loading };
};
