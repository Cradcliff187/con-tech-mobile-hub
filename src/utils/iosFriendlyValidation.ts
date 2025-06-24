/**
 * iOS-friendly validation utilities that don't interfere with natural typing
 * Only sanitize during form submission, not during user input
 */

/**
 * Sanitize data only when submitting forms, not during typing
 */
export const sanitizeOnSubmit = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Enforce length limit
};

/**
 * Sanitize email for submission
 */
export const sanitizeEmailOnSubmit = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '')
    .substring(0, 255);
};

/**
 * Sanitize phone for submission
 */
export const sanitizePhoneOnSubmit = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Keep only digits, spaces, hyphens, parentheses, and plus sign
  return input
    .trim()
    .replace(/[^0-9\s\-\(\)\+]/g, '')
    .substring(0, 20);
};

/**
 * Sanitize array of strings for submission
 */
export const sanitizeArrayOnSubmit = (input: string[]): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizeOnSubmit(item))
    .slice(0, 50);
};
