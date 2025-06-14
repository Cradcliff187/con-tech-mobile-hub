
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Database, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { user, profile } = useAuth();

  const runDatabaseTests = async () => {
    setTesting(true);
    const results: any = {
      userAuth: { success: false, data: null, error: null },
      profileQuery: { success: false, data: null, error: null },
      projectsQuery: { success: false, data: null, error: null },
      tasksQuery: { success: false, data: null, error: null },
      activityQuery: { success: false, data: null, error: null }
    };

    try {
      // Test 1: User authentication
      results.userAuth = {
        success: !!user,
        data: user ? { id: user.id, email: user.email } : null,
        error: user ? null : 'No authenticated user'
      };

      // Test 2: Profile query
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);
        
        results.profileQuery = {
          success: !profileError && profileData,
          data: profileData,
          error: profileError
        };
      }

      // Test 3: Projects query
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .limit(5);
      
      results.projectsQuery = {
        success: !projectsError,
        data: projectsData,
        error: projectsError
      };

      // Test 4: Tasks query
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(5);
      
      results.tasksQuery = {
        success: !tasksError,
        data: tasksData,
        error: tasksError
      };

      // Test 5: Activity log query
      const { data: activityData, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .limit(5);
      
      results.activityQuery = {
        success: !activityError,
        data: activityData,
        error: activityError
      };

    } catch (error) {
      console.error('Database test failed:', error);
    }

    setTestResults(results);
    setTesting(false);
  };

  const TestResult = ({ title, result }: { title: string; result: any }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {result?.success ? (
          <CheckCircle size={16} className="text-green-600" />
        ) : (
          <AlertCircle size={16} className="text-red-600" />
        )}
        <span className="font-medium">{title}</span>
      </div>
      
      {result?.data && (
        <div className="text-sm text-slate-600 mb-2">
          Data: {Array.isArray(result.data) ? `${result.data.length} records` : 'Object'}
        </div>
      )}
      
      {result?.error && (
        <div className="text-sm text-red-600">
          Error: {result.error.message || JSON.stringify(result.error)}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database size={20} />
          Database Connectivity Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            Current user: {user?.email || 'Not authenticated'}<br/>
            Profile status: {profile?.account_status || 'Unknown'}<br/>
            User role: {profile?.role || 'Unknown'}
          </div>

          <Button 
            onClick={runDatabaseTests}
            disabled={testing}
            className="flex items-center gap-2"
          >
            {testing ? (
              <>
                <Loader size={16} className="animate-spin" />
                Testing...
              </>
            ) : (
              'Run Database Tests'
            )}
          </Button>

          {testResults && (
            <div className="space-y-3">
              <TestResult title="User Authentication" result={testResults.userAuth} />
              <TestResult title="Profile Query" result={testResults.profileQuery} />
              <TestResult title="Projects Query" result={testResults.projectsQuery} />
              <TestResult title="Tasks Query" result={testResults.tasksQuery} />
              <TestResult title="Activity Log Query" result={testResults.activityQuery} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
