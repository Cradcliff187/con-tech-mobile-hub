
export const validateSelectData = <T extends { id: string; name?: string }>(
  items: T[],
  nameField: keyof T = 'name'
) => {
  return items.filter(item => 
    item.id && 
    item.id.trim() !== '' && 
    item.id !== 'undefined' && 
    item.id !== 'null' &&
    item.id !== 'none' &&
    item.id !== 'all'
  );
};

export const getSelectDisplayName = (
  item: any, 
  nameFields: string[], 
  fallback: string = 'Unknown'
) => {
  for (const field of nameFields) {
    if (item[field] && item[field].trim() !== '') {
      return item[field];
    }
  }
  return fallback;
};

export const normalizeSelectValue = (value: string | null | undefined): string => {
  if (!value || value === 'null' || value === 'undefined' || value.trim() === '') {
    return 'none';
  }
  return value;
};

export const denormalizeSelectValue = (value: string): string | null => {
  if (value === 'none' || value === 'all' || !value || value.trim() === '') {
    return null;
  }
  return value;
};

// New validation functions for form fields
export const validateRequiredSelect = (value: string, fieldName: string): string | null => {
  if (!value || value === 'none' || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateOptionalSelect = (value: string): string | null => {
  // Optional fields are always valid
  return null;
};

export const validateDateRange = (startDate: string, endDate: string): string | null => {
  if (!startDate || !endDate) {
    return 'Both start and end dates are required';
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return 'End date must be after start date';
  }
  
  return null;
};

export const validateOperatorSelection = (
  operatorType: 'employee' | 'user',
  operatorId: string
): string | null => {
  if (!operatorId || operatorId === 'none') {
    return `Please select an ${operatorType}`;
  }
  return null;
};

// Helper to prepare optional fields for database operations
export const prepareOptionalSelectField = (value: string): string | null => {
  if (value === 'none' || value === '' || !value) {
    return null;
  }
  return value;
};

// Helper to prepare required fields for database operations  
export const prepareRequiredSelectField = (value: string): string => {
  if (value === 'none' || value === '' || !value) {
    throw new Error('Required field cannot be empty');
  }
  return value;
};
