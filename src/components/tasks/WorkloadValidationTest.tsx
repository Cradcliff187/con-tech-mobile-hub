
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkloadTestResult {
  database_function_works: boolean;
  sample_data_count: number;
  test_stakeholder_found: boolean;
  errors: string[];
}

export const WorkloadValidationTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<WorkloadTestResult | null>(null);
  const { toast } = useToast();

  const runValidationTest = async () => {
    setTesting(true);
    const testResult: WorkloadTestResult = {
      database_function_works: false,
      sample_data_count: 0,
      test_stakeholder_found: false,
      errors: []
    };

    try {
      // Test 1: Check if calculate_employee_utilization function works
      const { data: utilizationData, error: utilizationError } = await supabase
        .rpc('calculate_employee_utilization', {
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      if (utilizationError) {
        testResult.errors.push(`Database function error: ${utilizationError.message}`);
      } else {
        testResult.database_function_works = true;
        testResult.sample_data_count = utilizationData?.length || 0;
      }

      // Test 2: Check stakeholder assignments table
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('stakeholder_assignments')
        .select('id, stakeholder_id, project_id, total_hours')
        .limit(5);

      if (assignmentError) {
        testResult.errors.push(`Assignment table error: ${assignmentError.message}`);
      }

      // Test 3: Check for at least one stakeholder
      const { data: stakeholderData, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('id, stakeholder_type')
        .eq('stakeholder_type', 'employee')
        .limit(1);

      if (stakeholderError) {
        testResult.errors.push(`Stakeholder table error: ${stakeholderError.message}`);
      } else {
        testResult.test_stakeholder_found = (stakeholderData?.length || 0) > 0;
      }

    } catch (error) {
      testResult.errors.push(`Test execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setResult(testResult);
    setTesting(false);

    // Show toast result
    if (testResult.errors.length === 0 && testResult.database_function_works) {
      toast({
        title: "✅ Validation Passed",
        description: "Core assignment functionality is working correctly",
      });
    } else {
      toast({
        title: "⚠️ Issues Found", 
        description: `${testResult.errors.length} issue(s) detected`,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    if (testing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (!result) return <TestTube className="h-4 w-4" />;
    if (result.errors.length === 0 && result.database_function_works) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = () => {
    if (testing) return 'Running Tests...';
    if (!result) return 'Not Tested';
    if (result.errors.length === 0 && result.database_function_works) return 'All Systems Operational';
    return 'Issues Detected';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {getStatusIcon()}
          Core Assignment Validation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={runValidationTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Run Core Tests'}
        </Button>

        {result && (
          <div className="space-y-2">
            <Badge variant={result.errors.length === 0 ? "default" : "destructive"}>
              {getStatusText()}
            </Badge>

            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Database Function:</span>
                <span className={result.database_function_works ? 'text-green-600' : 'text-red-600'}>
                  {result.database_function_works ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sample Data:</span>
                <span>{result.sample_data_count} records</span>
              </div>
              <div className="flex justify-between">
                <span>Test Stakeholder:</span>
                <span className={result.test_stakeholder_found ? 'text-green-600' : 'text-yellow-600'}>
                  {result.test_stakeholder_found ? '✓' : 'None'}
                </span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                <div className="font-medium text-red-800 mb-1">Issues:</div>
                {result.errors.map((error, idx) => (
                  <div key={idx} className="text-red-600">• {error}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
