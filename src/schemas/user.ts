
import { z } from 'zod';
import { requiredString, optionalString, emailSchema, phoneSchema, sanitizedArraySchema } from './common';

export const userProfileSchema = z.object({
  full_name: requiredString(100)
    .refine(name => !/[<>]/g.test(name), 'Name contains invalid characters'),
  
  email: emailSchema,
  
  phone: phoneSchema.optional(),
  
  company: optionalString(200)
    .refine(company => !company || !/[<>]/g.test(company), 'Company name contains invalid characters'),
  
  role: z.enum(['admin', 'project_manager', 'site_supervisor', 'worker', 'stakeholder', 'client', 'vendor']),
  
  skills: sanitizedArraySchema(20, 50)
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;
