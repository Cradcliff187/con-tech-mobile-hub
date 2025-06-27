
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  testResults: {
    functionExists: boolean;
    sampleDataReturned: boolean;
    calculationsAccurate: boolean;
  };
}

export const useWorkloadValidation = () => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateWorkloadCalculations = async () => {
    setLoading(true);
    const errors: string[] = [];
    const warnings: string[] = [];
    const testResults = {
      functionExists: false,
      sampleDataReturned: false,
      calculationsAccurate: false,
    };

    try {
      // Test 1: Check if the function exists and can be called
      const { data: functionTest, error: functionError } = await supabase
        .rpc('calculate_employee_utilization', {
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });

      if (functionError) {
        errors.push(`Database function error: ${functionError.message}`);
      } else {
        testResults.functionExists = true;
        
        // Test 2: Check if sample data is returned
        if (functionTest && Array.isArray(functionTest)) {
          testResults.sampleDataReturned = true;
          
          // Test 3: Validate calculation accuracy on sample data
          if (functionTest.length > 0) {
            const sampleRecord = functionTest[0];
            const expectedUtilization = sampleRecord.max_available_hours > 0 
              ? (sampleRecord.total_allocated_hours / sampleRecord.max_available_hours) * 100 
              : 0;
            
            const actualUtilization = sampleRecord.utilization_percentage;
            const difference = Math.abs(expectedUtilization - actualUtilization);
            
            if (difference < 0.01) { // Allow for small floating point differences
              testResults.calculationsAccurate = true;
            } else {
              warnings.push(`Utilization calculation may be inaccurate. Expected: ${expectedUtilization.toFixed(2)}%, Got: ${actualUtilization.toFixed(2)}%`);
            }
          } else {
            warnings.push('No workload data found - this may be expected if no stakeholder assignments exist');
          }
        } else {
          errors.push('Function returned unexpected data format');
        }
      }

      // Test stakeholder assignments data structure
      const { data: assignmentsTest, error: assignmentsError } = await supabase
        .from('stakeholder_assignments')
        .select('id, stakeholder_id, project_id, total_hours, hourly_rate, status')
        .limit(5);

      if (assignmentsError) {
        warnings.push(`Stakeholder assignments query issue: ${assignmentsError.message}`);
      } else if (!assignmentsTest || assignmentsTest.length === 0) {
        warnings.push('No stakeholder assignments found - workload calculations will be empty');
      }

      // Test stakeholders data structure
      const { data: stakeholdersTest, error: stakeholdersError } = await supabase
        .from('stakeholders')
        .select('id, stakeholder_type, status, specialties')
        .eq('stakeholder_type', 'employee')
        .limit(5);

      if (stakeholdersError) {
        warnings.push(`Stakeholders query issue: ${stakeholdersError.message}`);
      } else if (!stakeholdersTest || stakeholdersTest.length === 0) {
        warnings.push('No employee stakeholders found - workload calculations will be empty');
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      testResults,
    };

    setValidationResult(result);
    
    // Show toast notification
    if (result.isValid) {
      if (warnings.length > 0) {
        toast({
          title: "Validation Passed with Warnings",
          description: `${warnings.length} warning(s) found. Check console for details.`,
        });
      } else {
        toast({
          title: "Validation Successful",
          description: "All workload calculation functions are working correctly.",
        });
      }
    } else {
      toast({
        title: "Validation Failed",
        description: `${errors.length} error(s) found. Check console for details.`,
        variant: "destructive",
      });
    }

    // Log detailed results to console
    console.group('🔍 Workload Validation Results');
    console.log('Overall Result:', result.isValid ? '✅ PASS' : '❌ FAIL');
    console.log('Test Results:', testResults);
    if (errors.length > 0) {
      console.error('Errors:', errors);
    }
    if (warnings.length > 0) {
      console.warn('Warnings:', warnings);
    }
    console.groupEnd();

    setLoading(false);
  };

  // Auto-validate on mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      validateWorkloadCalculations();
    }
  }, []);

  return {
    validationResult,
    loading,
    validateWorkloadCalculations,
  };
};
