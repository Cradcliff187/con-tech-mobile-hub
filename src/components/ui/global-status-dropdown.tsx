import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Entity type definitions
export type EntityType = 
  | 'project' 
  | 'task' 
  | 'stakeholder' 
  | 'equipment' 
  | 'maintenance_task' 
  | 'profile' 
  | 'budget_item';

// Status configurations for each entity type
const STATUS_CONFIGS = {
  project: {
    statuses: ['pre_construction', 'mobilization', 'construction', 'punch_list', 'final_inspection', 'closeout', 'warranty', 'on_hold', 'cancelled'],
    colors: {
      pre_construction: 'bg-slate-100 text-slate-800',
      mobilization: 'bg-blue-100 text-blue-800',
      construction: 'bg-orange-100 text-orange-800',
      punch_list: 'bg-purple-100 text-purple-800',
      final_inspection: 'bg-indigo-100 text-indigo-800',
      closeout: 'bg-green-100 text-green-800',
      warranty: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    },
    labels: {
      pre_construction: 'Pre-Construction',
      mobilization: 'Mobilization',
      construction: 'Construction',
      punch_list: 'Punch List',
      final_inspection: 'Final Inspection',
      closeout: 'Project Closeout',
      warranty: 'Warranty Period',
      on_hold: 'On Hold',
      cancelled: 'Cancelled'
    },
    criticalChanges: ['cancelled', 'on_hold']
  },
  task: {
    statuses: ['not-started', 'in-progress', 'completed', 'blocked'],
    colors: {
      'not-started': 'bg-slate-100 text-slate-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800'
    },
    labels: {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      completed: 'Completed',
      blocked: 'Blocked'
    },
    criticalChanges: ['blocked']
  },
  stakeholder: {
    statuses: ['active', 'inactive', 'pending', 'suspended'],
    colors: {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-slate-100 text-slate-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    },
    labels: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      suspended: 'Suspended'
    },
    criticalChanges: ['suspended', 'inactive']
  },
  equipment: {
    statuses: ['available', 'in-use', 'maintenance', 'out-of-service'],
    colors: {
      available: 'bg-green-100 text-green-800',
      'in-use': 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      'out-of-service': 'bg-red-100 text-red-800'
    },
    labels: {
      available: 'Available',
      'in-use': 'In Use',
      maintenance: 'Maintenance',
      'out-of-service': 'Out of Service'
    },
    criticalChanges: ['out-of-service', 'maintenance']
  },
  maintenance_task: {
    statuses: ['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'],
    colors: {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800'
    },
    labels: {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      overdue: 'Overdue'
    },
    criticalChanges: ['overdue', 'cancelled']
  },
  profile: {
    statuses: ['pending', 'approved', 'inactive'],
    colors: {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      inactive: 'bg-slate-100 text-slate-800'
    },
    labels: {
      pending: 'Pending',
      approved: 'Approved',
      inactive: 'Inactive'
    },
    criticalChanges: ['inactive']
  },
  budget_item: {
    statuses: ['pending', 'approved', 'rejected'],
    colors: {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    },
    labels: {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected'
    },
    criticalChanges: ['rejected']
  }
};

export interface GlobalStatusDropdownProps {
  entityType: EntityType;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void | Promise<void>;
  isUpdating?: boolean;
  showAsDropdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  confirmCriticalChanges?: boolean;
  className?: string;
}

export const GlobalStatusDropdown: React.FC<GlobalStatusDropdownProps> = ({
  entityType,
  currentStatus,
  onStatusChange,
  isUpdating = false,
  showAsDropdown = true,
  size = 'md',
  disabled = false,
  confirmCriticalChanges = true,
  className
}) => {
  const config = STATUS_CONFIGS[entityType];
  const isMobile = useIsMobile();
  
  if (!config) {
    console.warn(`No status configuration found for entity type: ${entityType}`);
    return null;
  }

  const getStatusColor = (status: string) => {
    return config.colors[status] || 'bg-slate-100 text-slate-800';
  };

  const getStatusLabel = (status: string) => {
    return config.labels[status] || status;
  };

  const isCriticalChange = (newStatus: string) => {
    return config.criticalChanges.includes(newStatus);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || disabled || isUpdating) return;
    
    console.log('Status change initiated:', { entityType, currentStatus, newStatus, isMobile });
    
    // Show confirmation for critical status changes
    if (confirmCriticalChanges && isCriticalChange(newStatus)) {
      const confirmMessage = `Are you sure you want to change status to ${getStatusLabel(newStatus)}? This action may have significant implications.`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Error handling is delegated to the parent component
    }
  };

  // Size configurations with mobile-optimized touch targets
  const sizeClasses = {
    sm: {
      trigger: isMobile ? 'min-h-[44px] min-w-[44px] px-3 text-sm touch-manipulation' : 'h-6 px-2 text-xs',
      badge: 'text-xs px-2 py-1'
    },
    md: {
      trigger: isMobile ? 'min-h-[44px] min-w-[44px] px-4 text-sm touch-manipulation' : 'h-8 px-3 text-sm',
      badge: 'text-sm px-3 py-1'
    },
    lg: {
      trigger: isMobile ? 'min-h-[44px] min-w-[44px] px-4 text-base touch-manipulation' : 'h-10 px-4 text-base',
      badge: 'text-base px-4 py-2'
    }
  };

  const currentSizeClasses = sizeClasses[size];

  // Badge-only mode (non-dropdown display)
  if (!showAsDropdown) {
    return (
      <Badge 
        className={cn(
          getStatusColor(currentStatus),
          currentSizeClasses.badge,
          className
        )}
      >
        {getStatusLabel(currentStatus)}
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={currentStatus}
        onValueChange={handleStatusChange}
        disabled={disabled || isUpdating}
      >
        <SelectTrigger 
          className={cn(
            "w-auto border-0 relative",
            getStatusColor(currentStatus),
            currentSizeClasses.trigger
          )}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Dropdown trigger clicked', { isMobile, entityType });
          }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={cn(
          "bg-white border border-slate-200 shadow-lg",
          isMobile ? "z-[9999] min-w-[200px]" : "z-50"
        )}>
          {config.statuses.map((status) => (
            <SelectItem key={status} value={status}>
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    getStatusColor(status).split(' ')[0] // Extract background color class
                  )}
                />
                {getStatusLabel(status)}
              </div>
            </SelectItem>
          ))}
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

// Utility function to get status configuration for external use
export const getStatusConfig = (entityType: EntityType) => {
  return STATUS_CONFIGS[entityType];
};

// Utility function to check if a status change is critical
export const isCriticalStatusChange = (entityType: EntityType, newStatus: string) => {
  const config = STATUS_CONFIGS[entityType];
  return config?.criticalChanges.includes(newStatus) || false;
};

// Utility function to get all available statuses for an entity type
export const getAvailableStatuses = (entityType: EntityType) => {
  const config = STATUS_CONFIGS[entityType];
  return config?.statuses || [];
};

// Utility function to validate if a status is valid for an entity type
export const isValidStatus = (entityType: EntityType, status: string) => {
  const config = STATUS_CONFIGS[entityType];
  return config?.statuses.includes(status) || false;
};

export default GlobalStatusDropdown;
