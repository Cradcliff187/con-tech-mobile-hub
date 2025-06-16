
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Task } from '@/types/database';
import { useTasks } from '@/hooks/useTasks';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Users, AlertTriangle } from 'lucide-react';

interface BulkTaskActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

export const BulkTaskActionsDialog = ({ open, onOpenChange, tasks }: BulkTaskActionsDialogProps) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [newStatus, setNewStatus] = useState<Task['status']>('not-started');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [selectedStakeholderId, setSelectedStakeholderId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { updateTask } = useTasks();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    const newSelection = new Set(selectedTaskIds);
    if (checked) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    setSelectedTaskIds(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(new Set(tasks.map(task => task.id)));
    } else {
      setSelectedTaskIds(new Set());
    }
  };

  const handleBulkAction = async () => {
    if (selectedTaskIds.size === 0) {
      toast({
        title: "No tasks selected",
        description: "Please select at least one task to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const selectedTasks = Array.from(selectedTaskIds);
      const promises = selectedTasks.map(taskId => {
        switch (bulkAction) {
          case 'update-status':
            return updateTask(taskId, { status: newStatus });
          case 'update-priority':
            return updateTask(taskId, { priority: newPriority });
          case 'assign-stakeholder':
            return updateTask(taskId, { assigned_stakeholder_id: selectedStakeholderId || undefined });
          default:
            return Promise.resolve({ error: null });
        }
      });

      await Promise.all(promises);

      toast({
        title: "Bulk action completed",
        description: `Successfully updated ${selectedTasks.length} tasks.`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform bulk action on tasks.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    // Note: This would require a deleteTask function in useTasks hook
    // For now, we'll show a placeholder message
    toast({
      title: "Feature not implemented",
      description: "Bulk delete functionality requires additional backend support.",
      variant: "destructive",
    });
  };

  const resetForm = () => {
    setSelectedTaskIds(new Set());
    setBulkAction('');
    setNewStatus('not-started');
    setNewPriority('medium');
    setSelectedStakeholderId('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const isAllSelected = selectedTaskIds.size === tasks.length && tasks.length > 0;
  const isIndeterminate = selectedTaskIds.size > 0 && selectedTaskIds.size < tasks.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Task Actions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Task Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) {
                    const input = el.querySelector('input');
                    if (input) {
                      input.indeterminate = isIndeterminate;
                    }
                  }
                }}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({selectedTaskIds.size} of {tasks.length} selected)
              </label>
            </div>
            
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={selectedTaskIds.has(task.id)}
                    onCheckedChange={(checked) => handleTaskSelection(task.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-slate-500">
                      {task.status} • {task.priority}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Action
              </label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update-status">Update Status</SelectItem>
                  <SelectItem value="update-priority">Update Priority</SelectItem>
                  <SelectItem value="assign-stakeholder">Assign Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional Action Parameters */}
            {bulkAction === 'update-status' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Status
                </label>
                <Select value={newStatus} onValueChange={(value: Task['status']) => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'update-priority' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Priority
                </label>
                <Select value={newPriority} onValueChange={(value: Task['priority']) => setNewPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkAction === 'assign-stakeholder' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assign Stakeholder
                </label>
                <Select value={selectedStakeholderId} onValueChange={setSelectedStakeholderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stakeholder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassign</SelectItem>
                    {stakeholders.map((stakeholder) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.contact_person || stakeholder.company_name || stakeholder.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={selectedTaskIds.size === 0}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tasks</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedTaskIds.size} selected tasks? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedTaskIds.size === 0 || isProcessing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? 'Processing...' : 'Apply Action'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
