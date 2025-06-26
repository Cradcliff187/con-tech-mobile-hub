
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
import { useProjects } from '@/hooks/useProjects';
import { ProgressField } from './ProgressField';

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
  disabled?: boolean;
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
  disabled = false
}) => {
  const { projects } = useProjects();

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
          className="focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div>
        <label htmlFor="project" className="block text-sm font-medium text-slate-700 mb-1">
          Project *
        </label>
        <Select value={projectId} onValueChange={onProjectChange} disabled={disabled}>
          <SelectTrigger className="focus:ring-2 focus:ring-orange-300">
            <SelectValue placeholder="Select project" />
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
          className="focus:ring-2 focus:ring-orange-300"
        />
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
            <SelectTrigger className="focus:ring-2 focus:ring-orange-300">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
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
                  !dueDate && "text-muted-foreground"
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
      </div>
    </>
  );
};
