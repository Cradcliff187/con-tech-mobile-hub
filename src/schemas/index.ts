
import { z } from 'zod';

/**
 * Comprehensive validation schemas using Zod for type-safe validation
 * These schemas provide both runtime validation and TypeScript types
 */

// Common field validation patterns
const requiredString = (maxLength = 255) => 
  z.string()
    .min(1, 'This field is required')
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(str => str.trim());

const optionalString = (maxLength = 255) => 
  z.string()
    .max(maxLength, `Maximum ${maxLength} characters allowed`)
    .transform(str => str.trim())
    .optional();

const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(255, 'Email too long')
  .transform(str => str.trim().toLowerCase());

const phoneSchema = z.string()
  .regex(/^[\d\s\-\(\)\+]*$/, 'Phone number contains invalid characters')
  .max(20, 'Phone number too long')
  .transform(str => str.trim());

const urlSchema = z.string()
  .url('Please enter a valid URL')
  .max(2000, 'URL too long')
  .refine(url => /^https?:\/\//.test(url), 'Only HTTP and HTTPS URLs are allowed');

// Project validation schema
export const projectSchema = z.object({
  name: requiredString(100)
    .refine(name => !/[<>]/g.test(name), 'Project name contains invalid characters'),
  
  description: optionalString(2000)
    .refine(desc => !desc || !/javascript:/gi.test(desc), 'Description contains potentially dangerous content'),
  
  street_address: optionalString(200)
    .refine(addr => !addr || !/[<>]/g.test(addr), 'Address contains invalid characters'),
  
  city: optionalString(100)
    .refine(city => !city || !/[<>]/g.test(city), 'City contains invalid characters'),
  
  state: optionalString(50)
    .refine(state => !state || /^[a-zA-Z\s]*$/.test(state), 'State should only contain letters'),
  
  zip_code: optionalString(20)
    .refine(zip => !zip || /^[\d\-\s]*$/.test(zip), 'ZIP code should only contain numbers, spaces, and hyphens'),
  
  budget: z.union([
    z.string().transform(str => str === '' ? undefined : parseFloat(str)),
    z.number(),
    z.undefined()
  ]).refine(budget => budget === undefined || (budget >= 0 && budget <= 999999999), 
    'Budget must be between 0 and 999,999,999'),
  
  client_id: z.string().uuid('Please select a valid client'),
  
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  start_date: z.string().optional()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format'),
  
  end_date: z.string().optional()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format')
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
});

// Task validation schema
export const taskSchema = z.object({
  title: requiredString(200)
    .refine(title => !/[<>]/g.test(title), 'Task title contains invalid characters'),
  
  description: optionalString(5000)
    .refine(desc => !desc || !/javascript:/gi.test(desc), 'Description contains potentially dangerous content'),
  
  project_id: z.string().uuid('Please select a valid project'),
  
  category: optionalString(100)
    .refine(cat => !cat || !/[<>]/g.test(cat), 'Category contains invalid characters'),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  
  status: z.enum(['not-started', 'in-progress', 'completed', 'blocked', 'cancelled']),
  
  task_type: z.enum(['regular', 'milestone', 'inspection', 'maintenance']).optional(),
  
  due_date: z.string().optional()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format'),
  
  start_date: z.string().optional()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format'),
  
  estimated_hours: z.union([
    z.string().transform(str => str === '' ? undefined : parseInt(str)),
    z.number(),
    z.undefined()
  ]).refine(hours => hours === undefined || (hours >= 0 && hours <= 10000), 
    'Estimated hours must be between 0 and 10,000'),
  
  required_skills: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .transform(skills => skills.filter(skill => skill.trim().length > 0 && !/[<>]/g.test(skill))),
  
  punch_list_category: optionalString(100),
  
  assigned_stakeholder_id: z.string().uuid().optional(),
  
  progress: z.number().min(0).max(100).optional()
}).refine(data => {
  if (data.start_date && data.due_date) {
    return new Date(data.start_date) <= new Date(data.due_date);
  }
  return true;
}, {
  message: "Due date must be after start date",
  path: ["due_date"]
});

// Stakeholder validation schema
export const stakeholderSchema = z.object({
  stakeholder_type: z.enum(['client', 'subcontractor', 'employee', 'vendor']),
  
  company_name: optionalString(200)
    .refine(name => !name || !/[<>]/g.test(name), 'Company name contains invalid characters'),
  
  contact_person: requiredString(100)
    .refine(name => !/[<>]/g.test(name), 'Contact person name contains invalid characters'),
  
  email: z.union([emailSchema, z.literal('')]).optional(),
  
  phone: z.union([phoneSchema, z.literal('')]).optional(),
  
  street_address: optionalString(200)
    .refine(addr => !addr || !/[<>]/g.test(addr), 'Address contains invalid characters'),
  
  city: optionalString(100)
    .refine(city => !city || !/[<>]/g.test(city), 'City contains invalid characters'),
  
  state: optionalString(50)
    .refine(state => !state || /^[a-zA-Z\s]*$/.test(state), 'State should only contain letters'),
  
  zip_code: optionalString(20)
    .refine(zip => !zip || /^[\d\-\s]*$/.test(zip), 'ZIP code should only contain numbers, spaces, and hyphens'),
  
  specialties: z.array(z.string().max(50))
    .max(15, 'Maximum 15 specialties allowed')
    .transform(specs => specs.filter(spec => spec.trim().length > 0 && !/[<>]/g.test(spec))),
  
  crew_size: z.union([
    z.string().transform(str => str === '' ? undefined : parseInt(str)),
    z.number(),
    z.undefined()
  ]).refine(size => size === undefined || (size >= 0 && size <= 1000), 
    'Crew size must be between 0 and 1,000'),
  
  license_number: optionalString(100)
    .refine(license => !license || /^[a-zA-Z0-9\-\s]*$/.test(license), 'License number contains invalid characters'),
  
  insurance_expiry: z.string().optional()
    .refine(date => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 'Invalid date format'),
  
  notes: optionalString(2000)
    .refine(notes => !notes || !/javascript:/gi.test(notes), 'Notes contain potentially dangerous content'),
  
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

// User profile validation schema
export const userProfileSchema = z.object({
  full_name: requiredString(100)
    .refine(name => !/[<>]/g.test(name), 'Name contains invalid characters'),
  
  email: emailSchema,
  
  phone: phoneSchema.optional(),
  
  company: optionalString(200)
    .refine(company => !company || !/[<>]/g.test(company), 'Company name contains invalid characters'),
  
  role: z.enum(['admin', 'project_manager', 'site_supervisor', 'worker', 'stakeholder', 'client', 'vendor']),
  
  skills: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .transform(skills => skills.filter(skill => skill.trim().length > 0 && !/[<>]/g.test(skill)))
});

// Document upload validation schema
export const documentUploadSchema = z.object({
  name: requiredString(255)
    .refine(name => !/[<>]/g.test(name), 'Document name contains invalid characters')
    .transform(name => name.replace(/[^a-zA-Z0-9\-_\.]/g, '_')),
  
  category: optionalString(100)
    .refine(cat => !cat || !/[<>]/g.test(cat), 'Category contains invalid characters'),
  
  project_id: z.string().uuid().optional(),
  
  file_type: z.string()
    .refine(type => /^[a-zA-Z0-9\/\-]*$/.test(type), 'Invalid file type'),
  
  file_size: z.number()
    .max(10 * 1024 * 1024, 'File size must be less than 10MB')
});

// Message/Communication validation schema
export const messageSchema = z.object({
  content: requiredString(5000)
    .refine(content => !/javascript:/gi.test(content), 'Message contains potentially dangerous content'),
  
  message_type: z.enum(['text', 'system', 'notification']).optional(),
  
  project_id: z.string().uuid().optional()
});

// Export types for TypeScript
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type StakeholderFormData = z.infer<typeof stakeholderSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;

// Helper function to validate data and return errors
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
