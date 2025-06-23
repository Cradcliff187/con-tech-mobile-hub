
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { 
  getStatusMetadata,
  validateStatusTransition,
  updateProjectStatus,
  getAvailableTransitions
} from '@/utils/unified-lifecycle-utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UnifiedStatusDropdownProps {
  projectId: string;
  currentStatus: UnifiedLifecycleStatus;
  onStatusChange?: (newStatus: UnifiedLifecycleStatus) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showAsDropdown?: boolean;
  confirmCriticalChanges?: boolean;
  className?: string;
}

export const UnifiedStatusDropdown: React.FC<UnifiedStatusDropdownProps> = ({
  projectId,
  currentStatus,
  onStatusChange,
  size = 'md',
  disabled = false,
  showAsDropdown = true,
  confirmCriticalChanges = true,
  className
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableTransitions, setAvailableTransitions] = useState<any[]>([]);
  const [showTransitions, setShowTransitions] = useState(false);

  const currentMetadata = getStatusMetadata(currentStatus);

  const sizeClasses = {
    sm: { trigger: 'h-6 px-2 text-xs', badge: 'text-xs px-2 py-1' },
    md: { trigger: 'h-8 px-3 text-sm', badge: 'text-sm px-3 py-1' },
    lg: { trigger: 'h-10 px-4 text-base', badge: 'text-base px-4 py-2' }
  };

  const currentSizeClasses = sizeClasses[size];

  const handleStatusChange = async (newStatus: UnifiedLifecycleStatus) => {
    if (newStatus === currentStatus || disabled || isUpdating) return;

    // Show confirmation for critical status changes
    if (confirmCriticalChanges && ['cancelled', 'on_hold'].includes(newStatus)) {
      const confirmMessage = `Are you sure you want to change status to ${getStatusMetadata(newStatus).label}? This action may have significant implications.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setIsUpdating(true);

    try {
      const result = await updateProjectStatus(projectId, newStatus);
      
      if (result.success) {
        toast.success(`Project status updated to ${getStatusMetadata(newStatus).label}`);
        onStatusChange?.(newStatus);
      } else {
        toast.error(result.error || 'Failed to update project status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    } finally {
      setIsUpdating(false);
    }
  };

  const loadAvailableTransitions = async () => {
    try {
      const transitions = await getAvailableTransitions(currentStatus);
      setAvailableTransitions(transitions);
      setShowTransitions(true);
    } catch (error) {
      console.error('Error loading transitions:', error);
      toast.error('Failed to load available transitions');
    }
  };

  // Badge-only mode (non-dropdown display)
  if (!showAsDropdown) {
    return (
      <Badge 
        className={cn(
          currentMetadata.color,
          currentMetadata.textColor,
          currentSizeClasses.badge,
          className
        )}
      >
        {currentMetadata.label}
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || isUpdating}
        onOpenChange={(open) => {
          if (open && !showTransitions) {
            loadAvailableTransitions();
          }
        }}
      >
        <SelectTrigger 
          className={cn(
            "w-auto border-0",
            currentMetadata.color,
            currentMetadata.textColor,
            currentSizeClasses.trigger
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {showTransitions ? (
            availableTransitions.length > 0 ? (
              availableTransitions.map((transition) => {
                const toMetadata = getStatusMetadata(transition.to_status);
                return (
                  <SelectItem key={transition.to_status} value={transition.to_status}>
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-2 h-2 rounded-full",
                          toMetadata.color
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{transition.transition_name}</span>
                        <span className="text-xs text-slate-500">{transition.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })
            ) : (
              <div className="p-2 text-sm text-slate-500">
                No transitions available from current status
              </div>
            )
          ) : (
            <div className="p-2 text-sm text-slate-500">
              Loading available transitions...
            </div>
          )}
        </SelectContent>
      </Select>
      
      {isUpdating && (
        <Loader2 className={cn(
          "animate-spin text-slate-500",
          size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
        )} />
      )}
    </div>
  );
};

export default UnifiedStatusDropdown;
