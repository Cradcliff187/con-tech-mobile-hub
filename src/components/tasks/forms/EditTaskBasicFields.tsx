
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task } from '@/types/database';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { ProgressField } from './ProgressField';
import { Project } from '@/types/database';

interface EditTaskBasicFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  status: Task['status'];
  onStatusChange: (status: string) => void;
  priority: Task['priority'];
  setPriority: (value: Task['priority']) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  projectId: string;
  onProjectChange: (projectId: string) => void;
  progress: number;
  setProgress: (value: number) => void;
  projects: Project[];
  disabled?: boolean;
  projectsLoading?: boolean;
  errors?: Record<string, string[]>;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const EditTaskBasicFields: React.FC<EditTaskBasicFieldsProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  status,
  onStatusChange,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  projectId,
  onProjectChange,
  progress,
  setProgress,
  projects,
  disabled = false,
  projectsLoading = false,
  errors,
  getFieldError
}) => {
  console.log('🐛 Debug project dropdown:', { 
    projectId, 
    projectIdType: typeof projectId,
    projectsIds: projects.map(p => p.id),
    projectsCount: projects.length 
  });

  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
          Task Title *
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
          disabled={disabled}
          className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('title') && "border-red-500 focus:ring-red-300"
          )}
        />
        {getFieldError?.('title') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('title')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">
          Project *
        </label>
        <Select value={projectId || undefined} onValueChange={onProjectChange} disabled={disabled || projectsLoading}>
          <SelectTrigger className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('project_id') && "border-red-500"
          )}>
            <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select project"} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{project.name}</span>
                  {project.unified_lifecycle_status && (
                    <span className="ml-2 text-xs text-slate-500 capitalize">
                      ({project.unified_lifecycle_status.replace('_', ' ')})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getFieldError?.('project_id') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('project_id')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description..."
          rows={3}
          disabled={disabled}
          className={cn(
            "focus:ring-2 focus:ring-orange-300",
            getFieldError?.('description') && "border-red-500 focus:ring-red-300"
          )}
        />
        {getFieldError?.('description') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('description')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={status}
            onStatusChange={onStatusChange}
            disabled={disabled}
            confirmCriticalChanges={true}
          />
          {getFieldError?.('status') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('status')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <Select 
            value={priority} 
            onValueChange={(value: Task['priority']) => setPriority(value)}
            disabled={disabled}
          >
            <SelectTrigger className={cn(
              "focus:ring-2 focus:ring-orange-300",
              getFieldError?.('priority') && "border-red-500"
            )}>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError?.('priority') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('priority')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Due Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-300",
                  !dueDate && "text-muted-foreground",
                  getFieldError?.('due_date') && "border-red-500"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {getFieldError?.('due_date') && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {getFieldError('due_date')}
            </p>
          )}
        </div>
      </div>

      {/* Progress Field */}
      <div>
        <ProgressField
          progress={progress}
          setProgress={setProgress}
          status={status}
          disabled={disabled}
        />
        {getFieldError?.('progress') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('progress')}
          </p>
        )}
      </div>
    </>
  );
};
