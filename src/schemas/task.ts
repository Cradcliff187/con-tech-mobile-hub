
import { z } from 'zod';
import { requiredString, optionalString, integerFieldSchema, dateStringSchema, sanitizedArraySchema } from './common';

export const taskSchema = z.object({
  title: requiredString(200)
    .refine(title => !/[<>]/g.test(title), 'Task title contains invalid characters'),
  
  description: optionalString(5000)
    .refine(desc => !desc || !/javascript:/gi.test(desc), 'Description contains potentially dangerous content'),
  
  project_id: z.string().uuid('Please select a valid project'),
  
  category: optionalString(100)
    .refine(cat => !cat || !/[<>]/g.test(cat), 'Category contains invalid characters'),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  
  status: z.enum(['not-started', 'in-progress', 'completed', 'blocked']),
  
  task_type: z.enum(['regular', 'punch_list']).optional(),
  
  due_date: dateStringSchema,
  
  start_date: dateStringSchema,
  
  estimated_hours: integerFieldSchema(0, 10000),
  
  actual_hours: integerFieldSchema(0, 10000),
  
  progress: z.number().min(0, 'Progress must be at least 0%').max(100, 'Progress cannot exceed 100%').optional(),
  
  required_skills: sanitizedArraySchema(20, 50),
  
  punch_list_category: z.enum(['electrical', 'plumbing', 'carpentry', 'flooring', 'hvac', 'paint', 'other']).optional(),
  
  // Support both single and multiple stakeholder assignments
  assigned_stakeholder_id: z.string().uuid().optional(), // Legacy support
  assigned_stakeholder_ids: z.array(z.string().uuid()).optional(), // New multi-assignment
}).refine(data => {
  // Date consistency validation
  if (data.start_date && data.due_date) {
    return new Date(data.start_date) <= new Date(data.due_date);
  }
  return true;
}, {
  message: "Due date must be after start date",
  path: ["due_date"]
}).refine(data => {
  // Prevent conflicting assignments
  if (data.assigned_stakeholder_id && data.assigned_stakeholder_ids && data.assigned_stakeholder_ids.length > 0) {
    return false;
  }
  return true;
}, {
  message: "Cannot use both single and multiple stakeholder assignments",
  path: ["assigned_stakeholder_ids"]
}).refine(data => {
  // Punch list category requirement
  if (data.task_type === 'punch_list' && !data.punch_list_category) {
    return false;
  }
  return true;
}, {
  message: "Punch list category is required for punch list tasks",
  path: ["punch_list_category"]
});

export type TaskFormData = z.infer<typeof taskSchema>;

// Enhanced validation for edit scenarios
export const editTaskSchema = taskSchema.extend({
  id: z.string().uuid().optional(), // For edit mode
}).refine(data => {
  // Status-progress consistency for edit mode
  if (data.status && data.progress !== undefined) {
    const status = data.status;
    const progress = data.progress;

    if (status === 'not-started' && progress > 0) {
      return false;
    }
    
    if (status === 'completed' && progress < 100) {
      return false;
    }
    
    if (status === 'in-progress' && (progress <= 0 || progress >= 100)) {
      return false;
    }
  }
  return true;
}, {
  message: "Progress must align with task status",
  path: ["progress"]
});

export type EditTaskFormData = z.infer<typeof editTaskSchema>;
