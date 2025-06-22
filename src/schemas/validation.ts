
import { z } from 'zod';

/**
 * Helper function to validate data and return errors
 */
export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string[]> 
} => {
  try {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach(err => {
        const field = err.path.join('.');
        if (!errors[field]) errors[field] = [];
        errors[field].push(err.message);
      });
      return { success: false, errors };
    }
  } catch (error) {
    return { 
      success: false, 
      errors: { general: ['Validation failed'] } 
    };
  }
};
