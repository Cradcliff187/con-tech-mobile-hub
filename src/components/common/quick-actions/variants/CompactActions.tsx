
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { QuickAction } from '../types';
import { QuickActionDropdown } from '../QuickActionDropdown';
import { cn } from '@/lib/utils';

interface CompactActionsProps {
  primaryAction?: QuickAction;
  secondaryActions: QuickAction[];
  className?: string;
}

export const CompactActions = ({ primaryAction, secondaryActions, className }: CompactActionsProps) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        {primaryAction && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                onClick={primaryAction.action}
                className="h-8 w-8 p-0"
              >
                <primaryAction.icon size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{primaryAction.label}</p>
              {primaryAction.shortcut && (
                <p className="text-xs text-muted-foreground">{primaryAction.shortcut}</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}
        
        <QuickActionDropdown
          trigger={
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal size={14} />
            </Button>
          }
          actions={secondaryActions}
        />
      </div>
    </TooltipProvider>
  );
};
