
import { z } from 'zod';
import { requiredString, optionalString, emailSchema, phoneSchema, dateStringSchema, sanitizedArraySchema } from './common';

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
  
  specialties: sanitizedArraySchema(15, 50),
  
  crew_size: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? undefined : parsed;
      }
      return undefined;
    },
    z.number().min(0).max(1000).optional()
  ),
  
  license_number: optionalString(100)
    .refine(license => !license || /^[a-zA-Z0-9\-\s]*$/.test(license), 'License number contains invalid characters'),
  
  insurance_expiry: dateStringSchema,
  
  notes: optionalString(2000)
    .refine(notes => !notes || !/javascript:/gi.test(notes), 'Notes contain potentially dangerous content'),
  
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

export type StakeholderFormData = z.infer<typeof stakeholderSchema>;
