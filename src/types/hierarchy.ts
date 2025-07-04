export interface HierarchyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assignee?: string;
  category?: string;
  children: HierarchyTask[];
  expanded?: boolean;
}