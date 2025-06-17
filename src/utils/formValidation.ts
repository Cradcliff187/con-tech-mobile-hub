
import { validateRequiredSelect, validateOptionalSelect, validateDateRange, validateOperatorSelection } from './selectHelpers';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface AllocationFormData {
  projectId: string;
  operatorType: 'employee' | 'user';
  operatorId: string;
  taskId?: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface EquipmentFormData {
  name: string;
  type: string;
  status: string;
  maintenance_due: string;
}

export const validateAllocationForm = (data: AllocationFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Validate required fields
  const projectError = validateRequiredSelect(data.projectId, 'Project');
  if (projectError) errors.project = projectError;

  const operatorError = validateOperatorSelection(data.operatorType, data.operatorId);
  if (operatorError) errors.operator = operatorError;

  // Validate date range
  const dateError = validateDateRange(data.startDate, data.endDate);
  if (dateError) errors.dates = dateError;

  // Task is optional, so no validation needed

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateEquipmentForm = (data: EquipmentFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim() === '') {
    errors.name = 'Equipment name is required';
  }

  if (!data.type || data.type.trim() === '') {
    errors.type = 'Equipment type is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getFieldError = (errors: Record<string, string>, fieldName: string): string | undefined => {
  return errors[fieldName];
};

export const hasFieldError = (errors: Record<string, string>, fieldName: string): boolean => {
  return !!errors[fieldName];
};
