
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    statuses: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    colors: {
      planning: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-slate-100 text-slate-800'
    },
    labels: {
      planning: 'Planning',
      active: 'Active',
      'on-hold': 'On Hold',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },
    criticalChanges: ['cancelled', 'on-hold']
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
    statuses: ['available', 'in-use', 'maintenance', 'broken'],
    colors: {
      available: 'bg-green-100 text-green-800',
      'in-use': 'bg-blue-100 text-blue-800',
      maintenance: 'bg-orange-100 text-orange-800',
      broken: 'bg-red-100 text-red-800'
    },
    labels: {
      available: 'Available',
      'in-use': 'In Use',
      maintenance: 'Maintenance',
      broken: 'Broken'
    },
    criticalChanges: ['broken', 'maintenance']
  },
  maintenance_task: {
    statuses: ['scheduled', 'in_progress', 'completed', 'overdue'],
    colors: {
      scheduled: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    },
    labels: {
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      overdue: 'Overdue'
    },
    criticalChanges: ['overdue']
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

  // Size configurations
  const sizeClasses = {
    sm: {
      trigger: 'h-6 px-2 text-xs',
      badge: 'text-xs px-2 py-1'
    },
    md: {
      trigger: 'h-8 px-3 text-sm',
      badge: 'text-sm px-3 py-1'
    },
    lg: {
      trigger: 'h-10 px-4 text-base',
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
            "w-auto border-0",
            getStatusColor(currentStatus),
            currentSizeClasses.trigger
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
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
