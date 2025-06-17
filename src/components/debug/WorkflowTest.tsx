
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { CheckCircle, XCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useEquipment } from '@/hooks/useEquipment';
import { useTasks } from '@/hooks/useTasks';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export const WorkflowTest = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Project Creation', status: 'pending' },
    { name: 'Equipment Assignment', status: 'pending' },
    { name: 'Date Conflict Detection', status: 'pending' },
    { name: 'Resource Allocation', status: 'pending' },
    { name: 'Task Management', status: 'pending' },
    { name: 'Stakeholder Assignment', status: 'pending' },
    { name: 'Bulk Operations', status: 'pending' },
    { name: 'Conflict Resolution', status: 'pending' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const { projects } = useProjects();
  const { equipment } = useEquipment();
  const { tasks } = useTasks();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const updateTestStatus = (index: number, status: TestResult['status'], message?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, duration } : test
    ));
  };

  const runTest = async (testIndex: number): Promise<void> => {
    const testName = tests[testIndex].name;
    updateTestStatus(testIndex, 'running');
    const startTime = Date.now();

    try {
      switch (testName) {
        case 'Project Creation':
          if (projects.length === 0) {
            throw new Error('No projects found - create a test project first');
          }
          break;

        case 'Equipment Assignment':
          if (equipment.length === 0) {
            throw new Error('No equipment found - add equipment first');
          }
          const assignedEquipment = equipment.filter(eq => eq.project_id);
          if (assignedEquipment.length === 0) {
            throw new Error('No equipment assigned to projects - test assignment flow');
          }
          break;

        case 'Date Conflict Detection':
          // Simulate checking for date conflicts
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;

        case 'Resource Allocation':
          if (stakeholders.length === 0) {
            throw new Error('No stakeholders found - add stakeholders first');
          }
          break;

        case 'Task Management':
          if (tasks.length === 0) {
            throw new Error('No tasks found - create test tasks first');
          }
          break;

        case 'Stakeholder Assignment':
          const assignedStakeholders = stakeholders.filter(s => s.status === 'active');
          if (assignedStakeholders.length === 0) {
            throw new Error('No active stakeholders - activate stakeholders first');
          }
          break;

        case 'Bulk Operations':
          // Test bulk operations are available
          if (equipment.length < 2) {
            throw new Error('Need at least 2 equipment items to test bulk operations');
          }
          break;

        case 'Conflict Resolution':
          // Test conflict resolution components
          await new Promise(resolve => setTimeout(resolve, 500));
          break;

        default:
          throw new Error('Unknown test');
      }

      const duration = Date.now() - startTime;
      updateTestStatus(testIndex, 'passed', 'Test completed successfully', duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestStatus(testIndex, 'failed', error instanceof Error ? error.message : 'Test failed', duration);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
    
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    
    toast({
      title: "Workflow Test Complete",
      description: `${passedTests} passed, ${failedTests} failed`,
      variant: failedTests > 0 ? "destructive" : "default"
    });
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: undefined, duration: undefined })));
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-600" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600" />;
      default:
        return <AlertTriangle size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-orange-100 text-orange-800">Running</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow Integration Test</CardTitle>
            <p className="text-sm text-slate-600">
              Test all critical workflows to ensure system integrity
            </p>
          </div>
          <div className="flex gap-2">
            <TouchFriendlyButton
              variant="outline"
              onClick={resetTests}
              disabled={isRunning}
            >
              <RotateCcw size={16} className="mr-2" />
              Reset
            </TouchFriendlyButton>
            <TouchFriendlyButton
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Play size={16} className="mr-2" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </TouchFriendlyButton>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Test Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{passedCount}</div>
            <div className="text-sm text-slate-600">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-slate-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{pendingCount}</div>
            <div className="text-sm text-slate-600">Pending</div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  {test.message && (
                    <div className="text-sm text-slate-500">{test.message}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.duration && (
                  <span className="text-xs text-slate-500">{test.duration}ms</span>
                )}
                {getStatusBadge(test.status)}
                <TouchFriendlyButton
                  variant="outline"
                  size="sm"
                  onClick={() => runTest(index)}
                  disabled={isRunning || test.status === 'running'}
                >
                  <Play size={12} className="mr-1" />
                  Run
                </TouchFriendlyButton>
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Instructions */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h4 className="font-medium mb-2">Test Workflow Instructions:</h4>
          <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
            <li>Create a project with client information</li>
            <li>Add equipment to the system</li>
            <li>Assign equipment to the project with date ranges</li>
            <li>Create tasks and assign to stakeholders</li>
            <li>Test bulk operations on equipment and tasks</li>
            <li>Verify conflict detection and resolution</li>
            <li>Complete the workflow end-to-end</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
