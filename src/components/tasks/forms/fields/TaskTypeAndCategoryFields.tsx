
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TaskTypeAndCategoryFieldsProps {
  taskType: 'regular' | 'punch_list';
  setTaskType: (value: 'regular' | 'punch_list') => void;
  category: string;
  setCategory: (value: string) => void;
  disabled?: boolean;
  getFieldError?: (fieldName: string) => string | undefined;
}

const taskCategories = [
  'Foundation', 'Framing', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 
  'Drywall', 'Flooring', 'Painting', 'Landscaping', 'Cleanup', 'Inspection'
];

export const TaskTypeAndCategoryFields: React.FC<TaskTypeAndCategoryFieldsProps> = ({
  taskType,
  setTaskType,
  category,
  setCategory,
  disabled = false,
  getFieldError
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Task Type
        </label>
        <Select 
          value={taskType} 
          onValueChange={(value: 'regular' | 'punch_list') => setTaskType(value)}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('task_type') && "border-red-500"
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular Task</SelectItem>
            <SelectItem value="punch_list">Punch List Item</SelectItem>
          </SelectContent>
        </Select>
        {getFieldError?.('task_type') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('task_type')}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Category
        </label>
        <Select 
          value={category} 
          onValueChange={setCategory}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('category') && "border-red-500"
          )}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {taskCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError?.('category') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('category')}
          </p>
        )}
      </div>
    </div>
  );
};
