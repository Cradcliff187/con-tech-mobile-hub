
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { getStatusMetadata } from '@/utils/unified-lifecycle-utils';
import { cn } from '@/lib/utils';

interface UnifiedLifecycleStatusBadgeProps {
  status: UnifiedLifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

export const UnifiedLifecycleStatusBadge: React.FC<UnifiedLifecycleStatusBadgeProps> = ({
  status,
  size = 'md',
  showDescription = false,
  className
}) => {
  const metadata = getStatusMetadata(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <Badge 
        className={cn(
          metadata.color,
          metadata.textColor,
          sizeClasses[size],
          "font-medium border-0"
        )}
      >
        {metadata.label}
      </Badge>
      {showDescription && size !== 'sm' && (
        <span className="text-xs text-slate-500 mt-1">
          {metadata.description}
        </span>
      )}
    </div>
  );
};

export default UnifiedLifecycleStatusBadge;
