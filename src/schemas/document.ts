
import { z } from 'zod';
import { requiredString, optionalString } from './common';

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

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
