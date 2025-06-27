
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

interface AssignmentValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const useAssignmentValidation = () => {
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();

  const validateAssignmentData = useCallback(async (assignmentData: {
    stakeholder_id: string;
    project_id: string;
    hourly_rate?: number;
    total_hours?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<AssignmentValidationResult> => {
    setValidating(true);
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    try {
      // Validate stakeholder exists and is active
      const { data: stakeholder, error: stakeholderError } = await supabase
        .from('stakeholders')
        .select('id, stakeholder_type, status')
        .eq('id', assignmentData.stakeholder_id)
        .single();

      if (stakeholderError || !stakeholder) {
        errors.push({
          field: 'stakeholder_id',
          message: 'Selected stakeholder does not exist or is inaccessible',
          severity: 'error'
        });
      } else if (stakeholder.status !== 'active') {
        warnings.push({
          field: 'stakeholder_id',
          message: `Stakeholder status is '${stakeholder.status}', not 'active'`,
          severity: 'warning'
        });
      }

      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, status')
        .eq('id', assignmentData.project_id)
        .single();

      if (projectError || !project) {
        errors.push({
          field: 'project_id',
          message: 'Selected project does not exist or is inaccessible',
          severity: 'error'
        });
      } else if (project.status === 'completed' || project.status === 'cancelled') {
        warnings.push({
          field: 'project_id',
          message: `Project status is '${project.status}' - assignments may not be needed`,
          severity: 'warning'
        });
      }

      // Validate hourly rate
      if (assignmentData.hourly_rate !== undefined) {
        if (assignmentData.hourly_rate < 0) {
          errors.push({
            field: 'hourly_rate',
            message: 'Hourly rate cannot be negative',
            severity: 'error'
          });
        } else if (assignmentData.hourly_rate > 200) {
          warnings.push({
            field: 'hourly_rate',
            message: 'Hourly rate is unusually high (>$200/hr)',
            severity: 'warning'
          });
        }
      }

      // Validate total hours
      if (assignmentData.total_hours !== undefined) {
        if (assignmentData.total_hours < 0) {
          errors.push({
            field: 'total_hours',
            message: 'Total hours cannot be negative',
            severity: 'error'
          });
        } else if (assignmentData.total_hours > 80) {
          warnings.push({
            field: 'total_hours',
            message: 'Total hours per week is high (>80 hours)',
            severity: 'warning'
          });
        }
      }

      // Validate date range
      if (assignmentData.start_date && assignmentData.end_date) {
        const startDate = new Date(assignmentData.start_date);
        const endDate = new Date(assignmentData.end_date);
        
        if (endDate <= startDate) {
          errors.push({
            field: 'end_date',
            message: 'End date must be after start date',
            severity: 'error'
          });
        }
      }

      // Check for existing assignments (potential duplicates)
      const { data: existingAssignments, error: assignmentError } = await supabase
        .from('stakeholder_assignments')
        .select('id, role')
        .eq('stakeholder_id', assignmentData.stakeholder_id)
        .eq('project_id', assignmentData.project_id)
        .eq('status', 'assigned');

      if (assignmentError) {
        console.warn('Could not check for existing assignments:', assignmentError);
      } else if (existingAssignments && existingAssignments.length > 0) {
        warnings.push({
          field: 'stakeholder_id',
          message: `Stakeholder already has ${existingAssignments.length} active assignment(s) on this project`,
          severity: 'warning'
        });
      }

    } catch (error) {
      console.error('Validation error:', error);
      errors.push({
        field: 'general',
        message: 'Validation failed due to system error',
        severity: 'error'
      });
    }

    setValidating(false);

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  const validateBeforeAssignment = useCallback(async (assignmentData: any) => {
    const result = await validateAssignmentData(assignmentData);
    
    // Show toast for critical errors
    if (result.errors.length > 0) {
      toast({
        title: "Assignment Validation Failed",
        description: `${result.errors.length} error(s) must be resolved`,
        variant: "destructive"
      });
    } else if (result.warnings.length > 0) {
      toast({
        title: "Assignment Warnings",
        description: `${result.warnings.length} warning(s) detected`,
      });
    }

    return result;
  }, [validateAssignmentData, toast]);

  return {
    validateAssignmentData,
    validateBeforeAssignment,
    validating
  };
};
