
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { QuickAction } from '../types';
import { cn } from '@/lib/utils';

interface FloatingActionsProps {
  primaryAction?: QuickAction;
  secondaryActions: QuickAction[];
  className?: string;
}

export const FloatingActions = ({ primaryAction, secondaryActions, className }: FloatingActionsProps) => {
  return (
    <TooltipProvider>
      <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2", className)}>
        {/* Secondary actions (hidden by default, shown on hover) */}
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 flex flex-col gap-2">
          {secondaryActions.slice(0, 3).map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={action.action}
                  className="h-10 w-10 rounded-full shadow-lg relative"
                >
                  <action.icon size={16} />
                  {action.badge && (
                    <Badge 
                      variant={action.variant || 'default'} 
                      className="absolute -top-1 -right-1 text-xs h-5 w-5 p-0 flex items-center justify-center"
                    >
                      !
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{action.label}</p>
                {action.shortcut && (
                  <p className="text-xs text-muted-foreground">{action.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Primary action button */}
        {primaryAction && (
          <div className="group">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  onClick={primaryAction.action}
                  className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group-hover:scale-105"
                >
                  <primaryAction.icon size={24} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{primaryAction.label}</p>
                {primaryAction.shortcut && (
                  <p className="text-xs text-muted-foreground">{primaryAction.shortcut}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Quick action indicator */}
        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Zap size={12} />
            Quick Actions
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
