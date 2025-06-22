
// Type guard functions for form field validation

export function isNumericField(field: string): boolean {
  const numericFields = [
    'crew_size',
    'budget',
    'progress',
    'estimated_hours',
    'actual_hours',
    'hourly_rate',
    'total_cost',
    'total_hours'
  ];
  return numericFields.includes(field);
}

export function isArrayField(field: string): boolean {
  const arrayFields = [
    'specialties',
    'required_skills',
    'skills'
  ];
  return arrayFields.includes(field);
}

export function isDateField(field: string): boolean {
  const dateFields = [
    'start_date',
    'end_date',
    'due_date',
    'insurance_expiry',
    'scheduled_date'
  ];
  return dateFields.includes(field);
}

export function coerceFieldValue(field: string, value: any): any {
  // Handle empty values consistently
  if (value === '' || value === null || value === undefined) {
    return isNumericField(field) ? undefined : value;
  }

  // Handle numeric fields (crew_size, etc.) - let Zod preprocessing handle the conversion
  if (isNumericField(field)) {
    // Return the value as-is for numeric fields - Zod preprocessing will handle conversion
    return value;
  }

  // Handle array fields (specialties)
  if (isArrayField(field)) {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
    }
    return Array.isArray(value) ? value : [];
  }

  // Handle date fields
  if (isDateField(field)) {
    return typeof value === 'string' ? value : '';
  }

  // Handle string fields with basic sanitization
  return typeof value === 'string' ? value.trim() : value;
}
