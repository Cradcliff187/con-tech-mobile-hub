
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export const DatabaseVerification = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const { user, profile } = useAuth();

  const addResult = (name: string, status: 'success' | 'error' | 'warning', message: string) => {
    setResults(prev => [...prev, { name, status, message }]);
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: User authentication
      if (!user) {
        addResult('Authentication', 'error', 'User not authenticated');
        setTesting(false);
        return;
      }
      addResult('Authentication', 'success', `User authenticated: ${user.email}`);

      // Test 2: Profile access
      if (!profile) {
        addResult('Profile Access', 'error', 'Profile not loaded');
      } else {
        addResult('Profile Access', 'success', `Profile loaded: ${profile.role} (${profile.account_status})`);
      }

      // Test 3: Projects table
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id, name')
          .limit(5);
        
        if (projectsError) {
          addResult('Projects Table', 'error', `Error: ${projectsError.message}`);
        } else {
          addResult('Projects Table', 'success', `Found ${projects?.length || 0} projects`);
        }
      } catch (error: any) {
        addResult('Projects Table', 'error', `Exception: ${error.message}`);
      }

      // Test 4: Tasks table
      try {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('id, title')
          .limit(5);
        
        if (tasksError) {
          addResult('Tasks Table', 'error', `Error: ${tasksError.message}`);
        } else {
          addResult('Tasks Table', 'success', `Found ${tasks?.length || 0} tasks`);
        }
      } catch (error: any) {
        addResult('Tasks Table', 'error', `Exception: ${error.message}`);
      }

      // Test 5: Stakeholders table
      try {
        const { data: stakeholders, error: stakeholdersError } = await supabase
          .from('stakeholders')
          .select('id, company_name')
          .limit(5);
        
        if (stakeholdersError) {
          addResult('Stakeholders Table', 'error', `Error: ${stakeholdersError.message}`);
        } else {
          addResult('Stakeholders Table', 'success', `Found ${stakeholders?.length || 0} stakeholders`);
        }
      } catch (error: any) {
        addResult('Stakeholders Table', 'error', `Exception: ${error.message}`);
      }

      // Test 6: Resource allocations table
      try {
        const { data: resources, error: resourcesError } = await supabase
          .from('resource_allocations')
          .select('id, team_name')
          .limit(5);
        
        if (resourcesError) {
          addResult('Resource Allocations', 'error', `Error: ${resourcesError.message}`);
        } else {
          addResult('Resource Allocations', 'success', `Found ${resources?.length || 0} allocations`);
        }
      } catch (error: any) {
        addResult('Resource Allocations', 'error', `Exception: ${error.message}`);
      }

      // Test 7: Equipment table
      try {
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name')
          .limit(5);
        
        if (equipmentError) {
          addResult('Equipment Table', 'error', `Error: ${equipmentError.message}`);
        } else {
          addResult('Equipment Table', 'success', `Found ${equipment?.length || 0} equipment items`);
        }
      } catch (error: any) {
        addResult('Equipment Table', 'error', `Exception: ${error.message}`);
      }

      // Test 8: Documents table
      try {
        const { data: documents, error: documentsError } = await supabase
          .from('documents')
          .select('id, name')
          .limit(5);
        
        if (documentsError) {
          addResult('Documents Table', 'error', `Error: ${documentsError.message}`);
        } else {
          addResult('Documents Table', 'success', `Found ${documents?.length || 0} documents`);
        }
      } catch (error: any) {
        addResult('Documents Table', 'error', `Exception: ${error.message}`);
      }

      // Test 9: Messages table
      try {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('id, content')
          .limit(5);
        
        if (messagesError) {
          addResult('Messages Table', 'error', `Error: ${messagesError.message}`);
        } else {
          addResult('Messages Table', 'success', `Found ${messages?.length || 0} messages`);
        }
      } catch (error: any) {
        addResult('Messages Table', 'error', `Exception: ${error.message}`);
      }

      // Test 10: Task updates table
      try {
        const { data: taskUpdates, error: taskUpdatesError } = await supabase
          .from('task_updates')
          .select('id, message')
          .limit(5);
        
        if (taskUpdatesError) {
          addResult('Task Updates Table', 'error', `Error: ${taskUpdatesError.message}`);
        } else {
          addResult('Task Updates Table', 'success', `Found ${taskUpdates?.length || 0} task updates`);
        }
      } catch (error: any) {
        addResult('Task Updates Table', 'error', `Exception: ${error.message}`);
      }

      // Test 11: Weather data table
      try {
        const { data: weather, error: weatherError } = await supabase
          .from('weather_data')
          .select('id, location')
          .limit(5);
        
        if (weatherError) {
          addResult('Weather Data Table', 'error', `Error: ${weatherError.message}`);
        } else {
          addResult('Weather Data Table', 'success', `Found ${weather?.length || 0} weather records`);
        }
      } catch (error: any) {
        addResult('Weather Data Table', 'error', `Exception: ${weather.message}`);
      }

      // Test 12: User invitations table (admin only)
      if (profile?.role === 'admin') {
        try {
          const { data: invitations, error: invitationsError } = await supabase
            .from('user_invitations')
            .select('id, email')
            .limit(5);
          
          if (invitationsError) {
            addResult('User Invitations', 'error', `Error: ${invitationsError.message}`);
          } else {
            addResult('User Invitations', 'success', `Found ${invitations?.length || 0} invitations`);
          }
        } catch (error: any) {
          addResult('User Invitations', 'error', `Exception: ${error.message}`);
        }
      } else {
        addResult('User Invitations', 'warning', 'Skipped (admin only)');
      }

    } catch (error: any) {
      addResult('General Error', 'error', `Unexpected error: ${error.message}`);
    }

    setTesting(false);
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Database Verification Tests
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="ml-4"
          >
            {testing ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </CardTitle>
        {results.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✓ {successCount} passed</span>
            <span className="text-red-600">✗ {errorCount} failed</span>
            <span className="text-yellow-600">⚠ {warningCount} warnings</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getIcon(result.status)}
                <span className="font-medium">{result.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{result.message}</span>
                <Badge variant={getBadgeVariant(result.status)}>
                  {result.status}
                </Badge>
              </div>
            </div>
          ))}
          {results.length === 0 && !testing && (
            <div className="text-center py-8 text-slate-500">
              Click "Run All Tests" to verify database setup
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
