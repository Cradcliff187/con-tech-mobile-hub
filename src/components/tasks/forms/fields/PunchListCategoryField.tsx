
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PunchListCategoryFieldProps {
  punchListCategory: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '';
  setPunchListCategory: (value: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '') => void;
  disabled?: boolean;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const PunchListCategoryField: React.FC<PunchListCategoryFieldProps> = ({
  punchListCategory,
  setPunchListCategory,
  disabled = false,
  getFieldError
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Punch List Category *
      </label>
      <Select 
        value={punchListCategory} 
        onValueChange={(value: 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'paint' | 'other') => setPunchListCategory(value)}
        disabled={disabled}
      >
        <SelectTrigger className={cn(
          "focus:ring-2 focus:ring-orange-300",
          getFieldError?.('punch_list_category') && "border-red-500"
        )}>
          <SelectValue placeholder="Select punch list category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="electrical">Electrical</SelectItem>
          <SelectItem value="plumbing">Plumbing</SelectItem>
          <SelectItem value="carpentry">Carpentry</SelectItem>
          <SelectItem value="flooring">Flooring</SelectItem>
          <SelectItem value="hvac">HVAC</SelectItem>
          <SelectItem value="paint">Paint</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
      {getFieldError?.('punch_list_category') && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {getFieldError('punch_list_category')}
        </p>
      )}
    </div>
  );
};
