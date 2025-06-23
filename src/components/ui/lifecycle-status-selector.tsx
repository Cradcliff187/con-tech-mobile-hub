
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { LifecycleStatus } from '@/types/database';
import { 
  STATUS_CONFIG, 
  getSortedStatuses, 
  isValidTransition, 
  getStatusMetadata,
  checkTransitionPrerequisites
} from '@/types/projectStatus';

interface LifecycleStatusSelectorProps {
  value?: LifecycleStatus;
  onValueChange: (value: LifecycleStatus) => void;
  currentStatus?: LifecycleStatus;
  disabled?: boolean;
  showTransitionValidation?: boolean;
  projectData?: any;
  tasks?: any[];
  className?: string;
}

export const LifecycleStatusSelector = ({
  value,
  onValueChange,
  currentStatus,
  disabled = false,
  showTransitionValidation = false,
  projectData,
  tasks = [],
  className
}: LifecycleStatusSelectorProps) => {
  const sortedStatuses = getSortedStatuses(true);

  const getStatusOption = (status: LifecycleStatus) => {
    const metadata = getStatusMetadata(status);
    const isValidOption = !currentStatus || currentStatus === status || isValidTransition(currentStatus, status);
    
    let validationResult = { canTransition: true, warning: undefined as string | undefined };
    if (showTransitionValidation && currentStatus && currentStatus !== status && projectData) {
      validationResult = checkTransitionPrerequisites(currentStatus, status, projectData, tasks);
    }

    return {
      status,
      metadata,
      isValid: isValidOption && validationResult.canTransition,
      warning: validationResult.warning,
      isDisabled: !isValidOption || (!validationResult.canTransition && showTransitionValidation)
    };
  };

  const selectedMetadata = value ? getStatusMetadata(value) : null;

  return (
    <div className="space-y-2">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={`w-full ${className || ''}`}>
          <SelectValue placeholder="Select status">
            {selectedMetadata && (
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={`${selectedMetadata.bgColor} ${selectedMetadata.textColor} text-xs`}
                >
                  {selectedMetadata.label}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {sortedStatuses.map((status) => {
            const option = getStatusOption(status);
            
            return (
              <SelectItem 
                key={status} 
                value={status}
                disabled={option.isDisabled}
                className={`${option.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${option.metadata.bgColor} ${option.metadata.textColor} text-xs shrink-0`}
                    >
                      {option.metadata.label}
                    </Badge>
                    <span className="text-xs text-slate-600 hidden sm:inline">
                      {option.metadata.description}
                    </span>
                  </div>
                  {option.isValid && !option.isDisabled && (
                    <CheckCircle size={14} className="text-green-500 shrink-0" />
                  )}
                  {option.warning && (
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showTransitionValidation && value && currentStatus && value !== currentStatus && (
        <div className="space-y-2">
          {(() => {
            const validation = checkTransitionPrerequisites(currentStatus, value, projectData, tasks);
            if (validation.warning) {
              return (
                <Alert variant={validation.canTransition ? "default" : "destructive"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {validation.warning}
                  </AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );
};
