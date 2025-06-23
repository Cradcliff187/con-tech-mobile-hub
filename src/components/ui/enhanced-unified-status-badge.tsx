
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Settings, 
  Truck, 
  Hammer, 
  ListChecks, 
  ClipboardCheck, 
  FileText, 
  CheckCircle, 
  Pause, 
  X 
} from 'lucide-react';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { getStatusMetadata } from '@/utils/unified-lifecycle-utils';
import { cn } from '@/lib/utils';

interface EnhancedUnifiedStatusBadgeProps {
  status: UnifiedLifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
  className?: string;
}

const statusIcons: Record<UnifiedLifecycleStatus, React.ComponentType<any>> = {
  'pre_construction': Settings,
  'mobilization': Truck,
  'construction': Hammer,
  'punch_list': ListChecks,
  'final_inspection': ClipboardCheck,
  'closeout': FileText,
  'warranty': CheckCircle,
  'on_hold': Pause,
  'cancelled': X
};

export const EnhancedUnifiedStatusBadge: React.FC<EnhancedUnifiedStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  showTooltip = true,
  interactive = false,
  className
}) => {
  const metadata = getStatusMetadata(status);
  const IconComponent = statusIcons[status];

  const sizeClasses = {
    sm: {
      badge: 'text-xs px-2 py-1 h-6',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'text-sm px-3 py-1.5 h-8',
      icon: 'h-4 w-4'
    },
    lg: {
      badge: 'text-base px-4 py-2 h-10',
      icon: 'h-5 w-5'
    }
  };

  const currentSizeClasses = sizeClasses[size];

  const badgeElement = (
    <Badge 
      className={cn(
        metadata.color,
        metadata.textColor,
        currentSizeClasses.badge,
        'font-medium border-0 inline-flex items-center gap-1.5',
        interactive && 'cursor-pointer hover:opacity-80 transition-opacity',
        'touch-manipulation', // Better mobile interaction
        className
      )}
    >
      {showIcon && IconComponent && (
        <IconComponent className={cn(currentSizeClasses.icon, 'shrink-0')} />
      )}
      <span className="truncate">{metadata.label}</span>
    </Badge>
  );

  if (showTooltip && size !== 'lg') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeElement}
          </TooltipTrigger>
          <TooltipContent 
            className="bg-white border border-slate-200 shadow-lg z-50"
            sideOffset={4}
          >
            <div className="text-sm">
              <div className="font-medium text-slate-900">{metadata.label}</div>
              <div className="text-slate-600 max-w-xs">{metadata.description}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeElement;
};

export default EnhancedUnifiedStatusBadge;
