
import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TaskHoursFieldsProps {
  estimatedHours: number | undefined;
  setEstimatedHours: (value: number | undefined) => void;
  actualHours: number | undefined;
  setActualHours: (value: number | undefined) => void;
  disabled?: boolean;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const TaskHoursFields: React.FC<TaskHoursFieldsProps> = ({
  estimatedHours,
  setEstimatedHours,
  actualHours,
  setActualHours,
  disabled = false,
  getFieldError
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Estimated Hours
        </label>
        <Input
          type="number"
          min="0"
          step="0.5"
          value={estimatedHours || ''}
          onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          disabled={disabled}
          className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('estimated_hours') && "border-red-500 focus:ring-red-300"
          )}
        />
        {getFieldError?.('estimated_hours') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('estimated_hours')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Actual Hours
        </label>
        <Input
          type="number"
          min="0"
          step="0.5"
          value={actualHours || ''}
          onChange={(e) => setActualHours(e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0"
          disabled={disabled}
          className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('actual_hours') && "border-red-500 focus:ring-red-300"
          )}
        />
        {getFieldError?.('actual_hours') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('actual_hours')}
          </p>
        )}
      </div>
    </div>
  );
};
