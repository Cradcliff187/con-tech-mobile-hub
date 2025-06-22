
import { z } from 'zod';
import { requiredString } from './common';

export const messageSchema = z.object({
  content: requiredString(5000)
    .refine(content => !/javascript:/gi.test(content), 'Message contains potentially dangerous content'),
  
  message_type: z.enum(['text', 'system', 'notification']).optional(),
  
  project_id: z.string().uuid().optional()
});

export type MessageFormData = z.infer<typeof messageSchema>;
