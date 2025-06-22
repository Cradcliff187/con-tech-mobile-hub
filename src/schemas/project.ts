
import { z } from 'zod';
import { requiredString, optionalString, numericFieldSchema, dateStringSchema } from './common';

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
  
  budget: numericFieldSchema(0, 999999999),
  
  client_id: z.string().uuid('Please select a valid client'),
  
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  start_date: dateStringSchema,
  
  end_date: dateStringSchema
}).refine(data => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["end_date"]
});

export type ProjectFormData = z.infer<typeof projectSchema>;
