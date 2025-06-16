
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuickAction } from './types';
import { cn } from '@/lib/utils';

interface QuickActionButtonProps {
  action: QuickAction;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showBadge?: boolean;
}

export const QuickActionButton = ({ 
  action, 
  variant = 'default', 
  size = 'default',
  className,
  showBadge = true
}: QuickActionButtonProps) => {
  return (
    <Button
      variant={action.primary ? "default" : variant}
      size={size}
      onClick={action.action}
      className={cn("relative", className)}
    >
      <action.icon size={size === 'sm' ? 14 : size === 'lg' ? 24 : 16} className={size !== 'icon' ? "mr-2" : ""} />
      {size !== 'icon' && action.label}
      {showBadge && action.badge && (
        <Badge variant={action.variant || 'default'} className="ml-2 text-xs">
          {action.badge}
        </Badge>
      )}
    </Button>
  );
};
