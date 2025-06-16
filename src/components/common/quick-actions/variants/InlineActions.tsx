
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickAction } from '../types';
import { QuickActionButton } from '../QuickActionButton';
import { QuickActionDropdown } from '../QuickActionDropdown';
import { cn } from '@/lib/utils';

interface InlineActionsProps {
  actions: QuickAction[];
  className?: string;
}

export const InlineActions = ({ actions, className }: InlineActionsProps) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {actions.slice(0, 3).map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          variant={action.primary ? "default" : "outline"}
          size="sm"
        />
      ))}
      
      {actions.length > 3 && (
        <QuickActionDropdown
          trigger={
            <Button variant="outline" size="sm">
              <MoreHorizontal size={16} className="mr-2" />
              More
            </Button>
          }
          actions={actions.slice(3)}
        />
      )}
    </div>
  );
};
