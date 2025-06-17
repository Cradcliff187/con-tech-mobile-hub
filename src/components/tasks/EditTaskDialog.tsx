
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
  const [dueDate, setDueDate] = useState<Date | undefined>();
  
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
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task, open]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(undefined);
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
        due_date: dueDate?.toISOString(),
      })
    );
  }, [task, title, description, priority, dueDate, updateTask, updateOperation, toast, isViewMode]);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  }, [updateOperation.loading, resetForm, onOpenChange]);

  const formatDate = (date?: Date) => {
    if (!date) return 'No due date';
    return format(date, 'PPP');
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
