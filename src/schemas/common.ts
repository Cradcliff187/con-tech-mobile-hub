
import { z } from 'zod';

/**
 * Common validation patterns and utilities
 */

export const requiredString = (maxLength = 255) => 
  z.string()
    .min(1, 'This field is required')
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(str => str.trim());

export const optionalString = (maxLength = 255) => 
  z.string()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(str => str.trim())
    .optional();

export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email too long')
  .transform(str => str.trim().toLowerCase());

export const phoneSchema = z.string()
  .regex(/^[\d\s\-\(\)\+]*$/, 'Phone number contains invalid characters')
  .max(20, 'Phone number too long')
  .transform(str => str.trim());

export const dateStringSchema = z.string().optional()
  .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format');

export const numericFieldSchema = (min = 0, max = 999999999) => 
  z.union([
    z.string().transform(str => {
      if (str === '' || str === undefined) return undefined;
      const parsed = parseFloat(str);
      return isNaN(parsed) ? undefined : parsed;
    }),
    z.number(),
    z.undefined()
  ]).refine(num => num === undefined || (num >= min && num <= max), 
    `Must be between ${min} and ${max}`);

export const integerFieldSchema = (min = 0, max = 10000) => 
  z.union([
    z.string().transform(str => {
      if (str === '' || str === undefined) return undefined;
      const parsed = parseInt(str);
      return isNaN(parsed) ? undefined : parsed;
    }),
    z.number(),
    z.undefined()
  ]).refine(num => num === undefined || (num >= min && num <= max), 
    `Must be between ${min} and ${max}`);

export const sanitizedArraySchema = (maxItems = 20, maxLength = 50) =>
  z.array(z.string().max(maxLength))
    .max(maxItems, `Maximum ${maxItems} items allowed`)
    .transform(items => items.filter(item => item.trim().length > 0 && !/[<>]/g.test(item)));
