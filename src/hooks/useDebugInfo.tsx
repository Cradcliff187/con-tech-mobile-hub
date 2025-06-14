
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useDebugInfo = () => {
  const { user, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const testDatabaseConnection = async () => {
      if (!user) return;

      console.log('=== DATABASE CONNECTION TEST ===');
      console.log('Current user:', user);
      console.log('Current profile:', profile);

      try {
        // Test projects query
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*');
        
        console.log('Projects query result:', { projects, error: projectsError });

        // Test tasks query  
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
        
        console.log('Tasks query result:', { tasks, error: tasksError });

        // Test profiles query
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);
        
        console.log('Profile query result:', { profiles, error: profilesError });

        // Test activity log
        const { data: activities, error: activitiesError } = await supabase
          .from('activity_log')
          .select('*')
          .limit(5);
        
        console.log('Activity log query result:', { activities, error: activitiesError });

        setDebugInfo({
          projectsCount: projects?.length || 0,
          tasksCount: tasks?.length || 0,
          activitiesCount: activities?.length || 0,
          userProfile: profiles?.[0] || null,
          errors: {
            projects: projectsError,
            tasks: tasksError,
            profiles: profilesError,
            activities: activitiesError
          }
        });

      } catch (error) {
        console.error('Database connection test failed:', error);
      }
    };

    testDatabaseConnection();
  }, [user, profile]);

  return debugInfo;
};
