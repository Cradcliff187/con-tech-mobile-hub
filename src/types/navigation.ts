import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  children?: NavigationItem[];
  permission?: string;
}

export interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}