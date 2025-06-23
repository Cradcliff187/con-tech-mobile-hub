
import React from 'react';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';

interface TaskStatusFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showAsDropdown?: boolean;
}

export const TaskStatusField: React.FC<TaskStatusFieldProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'md',
  showAsDropdown = true
}) => {
  return (
    <GlobalStatusDropdown
      entityType="task"
      currentStatus={value}
      onStatusChange={onChange}
      disabled={disabled}
      size={size}
      showAsDropdown={showAsDropdown}
      confirmCriticalChanges={true}
    />
  );
};
