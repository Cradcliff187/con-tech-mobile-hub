
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

interface DebugModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export const DebugModeToggle = ({ isActive, onToggle }: DebugModeToggleProps) => {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <Bug size={14} />
      Debug
    </Button>
  );
};
