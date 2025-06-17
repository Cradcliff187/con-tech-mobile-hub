
import { Task } from '@/types/database';

// Helper function to map database response to Task interface
export const mapTaskFromDb = (dbTask: any): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  status: dbTask.status as Task['status'],
  priority: dbTask.priority as Task['priority'],
  due_date: dbTask.due_date,
  start_date: dbTask.start_date,
  created_at: dbTask.created_at,
  updated_at: dbTask.updated_at,
  project_id: dbTask.project_id,
  assignee_id: dbTask.assignee_id,
  assigned_stakeholder_id: dbTask.assigned_stakeholder_id,
  task_type: dbTask.task_type as Task['task_type'],
  required_skills: dbTask.required_skills,
  punch_list_category: dbTask.punch_list_category as Task['punch_list_category'],
  category: dbTask.category,
  estimated_hours: dbTask.estimated_hours,
  actual_hours: dbTask.actual_hours,
  progress: dbTask.progress || 0,
  created_by: dbTask.created_by,
  matches_skills: dbTask.matches_skills,
  converted_from_task_id: dbTask.converted_from_task_id,
  inspection_status: dbTask.inspection_status as Task['inspection_status'],
});
