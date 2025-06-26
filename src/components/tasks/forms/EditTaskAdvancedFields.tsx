
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskSkillsField } from './TaskSkillsField';

interface EditTaskAdvancedFieldsProps {
  taskType: 'regular' | 'punch_list';
  setTaskType: (value: 'regular' | 'punch_list') => void;
  category: string;
  setCategory: (value: string) => void;
  estimatedHours: number | undefined;
  setEstimatedHours: (value: number | undefined) => void;
  actualHours: number | undefined;
  setActualHours: (value: number | undefined) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  requiredSkills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  punchListCategory: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '';
  setPunchListCategory: (value: 'paint' | 'electrical' | 'plumbing' | 'carpentry' | 'flooring' | 'hvac' | 'other' | '') => void;
  disabled?: boolean;
  errors?: Record<string, string[]>;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const EditTaskAdvancedFields: React.FC<EditTaskAdvancedFieldsProps> = ({
  taskType,
  setTaskType,
  category,
  setCategory,
  estimatedHours,
  setEstimatedHours,
  actualHours,
  setActualHours,
  startDate,
  setStartDate,
  requiredSkills,
  newSkill,
  setNewSkill,
  onAddSkill,
  onRemoveSkill,
  punchListCategory,
  setPunchListCategory,
  disabled = false,
  errors,
  getFieldError
}) => {
  const taskCategories = [
    'Foundation', 'Framing', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 
    'Drywall', 'Flooring', 'Painting', 'Landscaping', 'Cleanup', 'Inspection'
  ];

  return (
    <>
      {/* Task Type & Category Row */}
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

      {/* Punch List Category (conditional) */}
      {taskType === 'punch_list' && (
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
      )}

      {/* Date & Hours Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Start Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-300",
                  !startDate && "text-muted-foreground",
                  getFieldError?.('start_date') && "border-red-500"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {getFieldError?.('start_date') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('start_date')}
            </p>
          )}
        </div>
      </div>

      {/* Hours Tracking */}
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

      {/* Required Skills */}
      <div>
        <TaskSkillsField
          requiredSkills={requiredSkills}
          newSkill={newSkill}
          setNewSkill={setNewSkill}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
        {getFieldError?.('required_skills') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('required_skills')}
          </p>
        )}
      </div>
    </>
  );
};
