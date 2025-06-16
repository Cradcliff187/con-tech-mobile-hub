
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { QuickAction } from './types';

interface QuickActionDropdownProps {
  trigger: React.ReactNode;
  actions: QuickAction[];
  title?: string;
  align?: 'start' | 'center' | 'end';
}

export const QuickActionDropdown = ({ 
  trigger, 
  actions, 
  title = "Quick Actions",
  align = "end" 
}: QuickActionDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel>{title}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem key={action.id} onClick={action.action}>
            <action.icon className="mr-2 h-4 w-4" />
            <span className="flex-1">{action.label}</span>
            {action.badge && (
              <Badge variant={action.variant || 'default'} className="ml-2 text-xs">
                {action.badge}
              </Badge>
            )}
            {action.shortcut && (
              <span className="text-xs text-muted-foreground ml-2">{action.shortcut}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
