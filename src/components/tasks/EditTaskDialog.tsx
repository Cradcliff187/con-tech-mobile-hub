
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CalendarIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { TaskSkillsField } from './forms/TaskSkillsField';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  mode?: 'edit' | 'view';
}

export const EditTaskDialog = memo(({ open, onOpenChange, task, mode = 'edit' }: EditTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('not-started');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  
  // Advanced fields
  const [taskType, setTaskType] = useState<'regular' | 'punch_list'>('regular');
  const [category, setCategory] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
  const [actualHours, setActualHours] = useState<number | undefined>();
  const [progress, setProgress] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [punchListCategory, setPunchListCategory] = useState<string>('');
  const [newSkill, setNewSkill] = useState('');
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const isViewMode = mode === 'view';

  const updateOperation = useAsyncOperation({
    successMessage: "Task updated successfully",
    errorMessage: "Failed to update task",
    onSuccess: () => {
      onOpenChange(false);
      resetForm();
    }
  });

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      
      // Advanced fields
      setTaskType(task.task_type || 'regular');
      setCategory(task.category || '');
      setEstimatedHours(task.estimated_hours || undefined);
      setActualHours(task.actual_hours || undefined);
      setProgress(task.progress || 0);
      setStartDate(task.start_date ? new Date(task.start_date) : undefined);
      setRequiredSkills(task.required_skills || []);
      setPunchListCategory(task.punch_list_category || '');
      setNewSkill('');
    }
  }, [task, open]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setStatus('not-started');
    setDueDate(undefined);
    setTaskType('regular');
    setCategory('');
    setEstimatedHours(undefined);
    setActualHours(undefined);
    setProgress(0);
    setStartDate(undefined);
    setRequiredSkills([]);
    setPunchListCategory('');
    setNewSkill('');
    setShowAdvanced(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !title.trim() || isViewMode) {
      if (!isViewMode) {
        toast({
          title: "Validation Error",
          description: "Task title is required.",
          variant: "destructive",
        });
      }
      return;
    }

    await updateOperation.execute(() => 
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        due_date: dueDate?.toISOString(),
        task_type: taskType,
        category: category.trim() || undefined,
        estimated_hours: estimatedHours,
        actual_hours: actualHours,
        progress,
        start_date: startDate?.toISOString(),
        required_skills: requiredSkills.length > 0 ? requiredSkills : undefined,
        punch_list_category: taskType === 'punch_list' && punchListCategory ? punchListCategory : undefined,
      })
    );
  }, [task, title, description, priority, status, dueDate, taskType, category, estimatedHours, actualHours, progress, startDate, requiredSkills, punchListCategory, updateTask, updateOperation, toast, isViewMode]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  }, [updateOperation.loading, resetForm, onOpenChange]);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as Task['status']);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim()) && requiredSkills.length < 20) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(requiredSkills.filter(skill => skill !== skillToRemove));
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'No date set';
    return format(date, 'PPP');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const taskCategories = [
    'Foundation', 'Framing', 'Roofing', 'Electrical', 'Plumbing', 'HVAC', 
    'Drywall', 'Flooring', 'Painting', 'Landscaping', 'Cleanup', 'Inspection'
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isViewMode ? 'Task Details' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        
        {isViewMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Task Title
              </label>
              <div className="text-slate-900 font-medium">{title}</div>
            </div>

            {description && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <div className="text-slate-700 whitespace-pre-wrap">{description}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <GlobalStatusDropdown
                  entityType="task"
                  currentStatus={status}
                  onStatusChange={() => {}}
                  showAsDropdown={false}
                  size="sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <div className="text-slate-700">{formatPriority(priority)}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <div className="text-slate-700">{formatDate(dueDate)}</div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Fields */}
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
                disabled={updateOperation.loading}
                className="focus:ring-2 focus:ring-orange-300"
              />
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
                disabled={updateOperation.loading}
                className="focus:ring-2 focus:ring-orange-300"
              />
            </div>

            {/* Primary Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <GlobalStatusDropdown
                  entityType="task"
                  currentStatus={status}
                  onStatusChange={handleStatusChange}
                  disabled={updateOperation.loading}
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
                  disabled={updateOperation.loading}
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
                      disabled={updateOperation.loading}
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

            {/* Advanced Fields */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center gap-2 p-0 h-auto font-medium text-slate-700 hover:text-slate-900"
                >
                  {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  Advanced Fields
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {/* Task Type & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Task Type
                    </label>
                    <Select 
                      value={taskType} 
                      onValueChange={(value: 'regular' | 'punch_list') => setTaskType(value)}
                      disabled={updateOperation.loading}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-orange-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular Task</SelectItem>
                        <SelectItem value="punch_list">Punch List Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <Select 
                      value={category} 
                      onValueChange={setCategory}
                      disabled={updateOperation.loading}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-orange-300">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Punch List Category (conditional) */}
                {taskType === 'punch_list' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Punch List Category
                    </label>
                    <Select 
                      value={punchListCategory} 
                      onValueChange={setPunchListCategory}
                      disabled={updateOperation.loading}
                    >
                      <SelectTrigger className="focus:ring-2 focus:ring-orange-300">
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
                  </div>
                )}

                {/* Date & Time Tracking */}
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
                            !startDate && "text-muted-foreground"
                          )}
                          disabled={updateOperation.loading}
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Progress (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
                      disabled={updateOperation.loading}
                      className="focus:ring-2 focus:ring-orange-300"
                    />
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
                      disabled={updateOperation.loading}
                      className="focus:ring-2 focus:ring-orange-300"
                    />
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
                      disabled={updateOperation.loading}
                      className="focus:ring-2 focus:ring-orange-300"
                    />
                  </div>
                </div>

                {/* Required Skills */}
                <TaskSkillsField
                  requiredSkills={requiredSkills}
                  newSkill={newSkill}
                  setNewSkill={setNewSkill}
                  onAddSkill={handleAddSkill}
                  onRemoveSkill={handleRemoveSkill}
                />
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={updateOperation.loading}
                className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateOperation.loading || !title.trim()}
                className="bg-orange-600 hover:bg-orange-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-300"
              >
                {updateOperation.loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
});

EditTaskDialog.displayName = 'EditTaskDialog';
