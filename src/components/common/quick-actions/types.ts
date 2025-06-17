
import { LucideIcon } from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  action: () => void;
  shortcut?: string;
  primary?: boolean;
  badge?: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export type ActionContext = 'dashboard' | 'planning' | 'tasks' | 'documents';
export type ActionVariant = 'floating' | 'inline' | 'compact';
