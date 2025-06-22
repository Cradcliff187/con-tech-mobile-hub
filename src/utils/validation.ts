import DOMPurify from 'dompurify';

/**
 * Sanitization utilities for preventing XSS attacks and ensuring data integrity
 */

// Configure DOMPurify for strict HTML sanitization
const sanitizeConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), sanitizeConfig);
};

/**
 * Sanitize plain text input by removing dangerous characters
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Enforce length limit
};

/**
 * Sanitize and validate email addresses
 */
export const sanitizeEmail = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '')
    .substring(0, 255); // Standard email length limit
};

/**
 * Sanitize phone numbers
 */
export const sanitizePhone = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Keep only digits, spaces, hyphens, parentheses, and plus sign
  return input
    .trim()
    .replace(/[^0-9\s\-\(\)\+]/g, '')
    .substring(0, 20);
};

/**
 * Sanitize URLs to prevent malicious protocols
 */
export const sanitizeUrl = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  const url = input.trim().toLowerCase();
  
  // Only allow http, https, and mailto protocols
  if (!url.match(/^(https?:\/\/|mailto:)/)) {
    return '';
  }
  
  return input.trim().substring(0, 2000);
};

/**
 * Sanitize file names for upload security
 */
export const sanitizeFileName = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .substring(0, 255);
};

/**
 * Sanitize numerical inputs
 */
export const sanitizeNumber = (input: string | number): number => {
  if (typeof input === 'number') return Math.max(0, input);
  if (!input || typeof input !== 'string') return 0;
  
  const num = parseFloat(input.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : Math.max(0, num);
};

/**
 * Sanitize arrays of strings (like skills, specialties)
 */
export const sanitizeStringArray = (input: string[]): string[] => {
  if (!Array.isArray(input)) return [];
  
  return input
    .filter(item => typeof item === 'string' && item.trim().length > 0)
    .map(item => sanitizeText(item))
    .slice(0, 50); // Limit array size
};

/**
 * General purpose input sanitizer that determines the appropriate method
 */
export const sanitizeInput = (input: unknown, type: 'text' | 'html' | 'email' | 'phone' | 'url' | 'number' = 'text'): string | number => {
  if (input === null || input === undefined) return type === 'number' ? 0 : '';
  
  const stringInput = String(input);
  
  switch (type) {
    case 'html':
      return sanitizeHtml(stringInput);
    case 'email':
      return sanitizeEmail(stringInput);
    case 'phone':
      return sanitizePhone(stringInput);
    case 'url':
      return sanitizeUrl(stringInput);
    case 'number':
      return sanitizeNumber(stringInput);
    case 'text':
    default:
      return sanitizeText(stringInput);
  }
};

/**
 * Validate file upload security
 */
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' };
  }
  
  // Check for potentially dangerous file names
  const sanitizedName = sanitizeFileName(file.name);
  if (sanitizedName !== file.name) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }
  
  return { isValid: true };
};
