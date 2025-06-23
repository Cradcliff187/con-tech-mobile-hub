
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';
import { getStatusMetadata } from '@/utils/unified-lifecycle-utils';
import { cn } from '@/lib/utils';

interface UnifiedLifecycleStatusSelectorProps {
  value: UnifiedLifecycleStatus;
  onValueChange: (value: UnifiedLifecycleStatus) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const UnifiedLifecycleStatusSelector: React.FC<UnifiedLifecycleStatusSelectorProps> = ({
  value,
  onValueChange,
  className,
  disabled = false,
  placeholder = "Select status"
}) => {
  const statusOptions: UnifiedLifecycleStatus[] = [
    'pre_construction',
    'mobilization',
    'construction',
    'punch_list',
    'final_inspection',
    'closeout',
    'warranty',
    'on_hold',
    'cancelled'
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
        {statusOptions.map((status) => {
          const metadata = getStatusMetadata(status);
          return (
            <SelectItem key={status} value={status} className="hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div 
                  className={cn("w-2 h-2 rounded-full", metadata.color)}
                />
                <span className="font-medium">{metadata.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default UnifiedLifecycleStatusSelector;
