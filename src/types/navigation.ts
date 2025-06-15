
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}
