
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapseToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const CollapseToggle = ({ isCollapsed, onToggle }: CollapseToggleProps) => {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      className="flex items-center gap-2"
      title={isCollapsed ? "Expand task cards" : "Collapse task cards"}
    >
      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      {isCollapsed ? 'Expand' : 'Collapse'}
    </Button>
  );
};
