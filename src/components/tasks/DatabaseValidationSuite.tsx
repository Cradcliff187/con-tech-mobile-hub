
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, XCircle, Loader2, Database, TestTube, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useProjects } from '@/hooks/useProjects';

interface ValidationResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: string;
  errorMessage?: string;
  data?: any;
}

interface ValidationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  results: ValidationResult[];
}

export const DatabaseValidationSuite: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const { toast } = useToast();
  const { assignments, createAssignment, updateAssignment, deleteAssignment } = useStakeholderAssignments();
  const { stakeholders } = useStakeholders();
  const { projects } = useProjects();

  const runTest = async (testName: string, testFn: () => Promise<any>): Promise<ValidationResult> => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      return {
        testName,
        passed: true,
        duration,
        details: `Test completed successfully in ${duration}ms`,
        data: result
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        testName,
        passed: false,
        duration,
        details: `Test failed after ${duration}ms`,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testDatabaseFunction = async () => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase.rpc('calculate_employee_utilization', {
      start_date: startDate,
      end_date: endDate
    });

    if (error) throw error;
    if (!Array.isArray(data)) throw new Error('Function returned invalid data format');
    
    return { recordCount: data.length, sampleRecord: data[0] };
  };

  const testAssignmentCRUD = async () => {
    // Find test data
    const testStakeholder = stakeholders.find(s => s.stakeholder_type === 'employee');
    const testProject = projects[0];
    
    if (!testStakeholder || !testProject) {
      throw new Error('Missing test data - need at least one employee stakeholder and one project');
    }

    // CREATE
    const createResult = await createAssignment({
      stakeholder_id: testStakeholder.id,
      project_id: testProject.id,
      role: 'Test Assignment',
      hourly_rate: 50,
      total_hours: 8,
      status: 'assigned'
    });

    if (createResult.error || !createResult.data) {
      throw new Error(`Create failed: ${createResult.error}`);
    }

    const assignmentId = createResult.data.id;

    // UPDATE
    const updateResult = await updateAssignment(assignmentId, {
      hourly_rate: 60,
      total_hours: 10
    });

    if (updateResult.error) {
      throw new Error(`Update failed: ${updateResult.error}`);
    }

    // DELETE
    const deleteResult = await deleteAssignment(assignmentId);
    if (deleteResult.error) {
      throw new Error(`Delete failed: ${deleteResult.error}`);
    }

    return { assignmentId, operationsCompleted: 3 };
  };

  const testWorkloadCalculationAccuracy = async () => {
    const testData = assignments.slice(0, 3); // Test with first 3 assignments
    const results = [];

    for (const assignment of testData) {
      const expectedCost = (assignment.total_hours || 0) * (assignment.hourly_rate || 0);
      const actualCost = assignment.total_cost || 0;
      const difference = Math.abs(expectedCost - actualCost);
      
      results.push({
        assignmentId: assignment.id,
        expectedCost,
        actualCost,
        difference,
        accurate: difference < 0.01
      });
    }

    const inaccurateCount = results.filter(r => !r.accurate).length;
    if (inaccurateCount > 0) {
      throw new Error(`${inaccurateCount} of ${results.length} cost calculations are inaccurate`);
    }

    return { testedAssignments: results.length, allAccurate: true };
  };

  const testDataIntegrity = async () => {
    // Test stakeholder assignments table integrity
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('stakeholder_assignments')
      .select('id, stakeholder_id, project_id, total_hours, hourly_rate, total_cost')
      .limit(10);

    if (assignmentError) throw assignmentError;

    // Test stakeholders table integrity
    const { data: stakeholderData, error: stakeholderError } = await supabase
      .from('stakeholders')
      .select('id, stakeholder_type, status')
      .limit(10);

    if (stakeholderError) throw stakeholderError;

    // Test foreign key relationships
    let orphanedAssignments = 0;
    for (const assignment of assignmentData || []) {
      const stakeholderExists = stakeholderData?.some(s => s.id === assignment.stakeholder_id);
      if (!stakeholderExists) orphanedAssignments++;
    }

    if (orphanedAssignments > 0) {
      throw new Error(`Found ${orphanedAssignments} assignments with invalid stakeholder references`);
    }

    return {
      assignmentRecords: assignmentData?.length || 0,
      stakeholderRecords: stakeholderData?.length || 0,
      orphanedAssignments
    };
  };

  const runFullValidation = async () => {
    setRunning(true);
    const results: ValidationResult[] = [];

    console.group('🔍 Database Validation Suite');

    const tests = [
      { name: 'Database Function Test', fn: testDatabaseFunction },
      { name: 'Assignment CRUD Test', fn: testAssignmentCRUD },
      { name: 'Workload Calculation Accuracy', fn: testWorkloadCalculationAccuracy },
      { name: 'Data Integrity Check', fn: testDataIntegrity }
    ];

    for (const test of tests) {
      console.log(`Running: ${test.name}`);
      const result = await runTest(test.name, test.fn);
      results.push(result);
      console.log(`${result.passed ? '✅' : '❌'} ${test.name}: ${result.details}`);
    }

    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.length - passedTests;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    const summary: ValidationSummary = {
      totalTests: results.length,
      passedTests,
      failedTests,
      totalDuration,
      results
    };

    setSummary(summary);
    console.groupEnd();

    // Show toast notification
    if (failedTests === 0) {
      toast({
        title: "✅ All Tests Passed",
        description: `${passedTests} tests completed successfully in ${totalDuration}ms`,
      });
    } else {
      toast({
        title: "⚠️ Some Tests Failed",
        description: `${failedTests} of ${results.length} tests failed`,
        variant: "destructive"
      });
    }

    setRunning(false);
  };

  const getStatusIcon = () => {
    if (running) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!summary) return <TestTube className="h-4 w-4" />;
    if (summary.failedTests === 0) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (running) return 'Running Validation Suite...';
    if (!summary) return 'Ready to Run';
    if (summary.failedTests === 0) return 'All Systems Operational';
    return `${summary.failedTests} Issues Found`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4" />
          Database & Persistence Validation Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <Button
            onClick={runFullValidation}
            disabled={running}
            size="sm"
            className="flex items-center gap-2"
          >
            <Activity className="h-3 w-3" />
            {running ? 'Running...' : 'Run Full Suite'}
          </Button>
        </div>

        {summary && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-50 p-2 rounded">
                <div className="text-lg font-bold">{summary.totalTests}</div>
                <div className="text-xs text-slate-500">Total Tests</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-lg font-bold text-green-600">{summary.passedTests}</div>
                <div className="text-xs text-green-600">Passed</div>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="text-lg font-bold text-red-600">{summary.failedTests}</div>
                <div className="text-xs text-red-600">Failed</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-lg font-bold text-blue-600">{summary.totalDuration}ms</div>
                <div className="text-xs text-blue-600">Total Time</div>
              </div>
            </div>

            <div className="space-y-2">
              {summary.results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {result.passed ? 
                      <CheckCircle className="h-4 w-4 text-green-600" /> : 
                      <XCircle className="h-4 w-4 text-red-600" />
                    }
                    <span className="text-sm font-medium">{result.testName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.duration}ms
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {summary.results.some(r => !r.passed) && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Test Failures:</div>
                    {summary.results.filter(r => !r.passed).map((result, idx) => (
                      <div key={idx} className="text-sm">
                        • {result.testName}: {result.errorMessage}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
