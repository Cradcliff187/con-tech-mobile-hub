import React, { useState, useCallback } from 'react';
import { Task } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  Copy, 
  Link2, 
  Calendar,
  User,
  CheckSquare,
  Square,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedTaskOperationsProps {
  selectedTasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskDuplicate: (taskId: string) => void;
  onBulkUpdate: (taskIds: string[], updates: Partial<Task>) => void;
  onCreateDependency: (fromTaskId: string, toTaskId: string) => void;
  isMultiSelectMode: boolean;
  onToggleMultiSelect: () => void;
}

export const EnhancedTaskOperations: React.FC<EnhancedTaskOperationsProps> = ({
  selectedTasks,
  onTaskUpdate,
  onTaskDelete,
  onTaskDuplicate,
  onBulkUpdate,
  onCreateDependency,
  isMultiSelectMode,
  onToggleMultiSelect
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [bulkEditField, setBulkEditField] = useState<string | null>(null);

  const handleInlineEdit = useCallback((task: Task) => {
    setEditingTaskId(task.id);
    setEditValue(task.title);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingTaskId && editValue.trim()) {
      onTaskUpdate(editingTaskId, { title: editValue.trim() });
    }
    setEditingTaskId(null);
    setEditValue('');
  }, [editingTaskId, editValue, onTaskUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditingTaskId(null);
    setEditValue('');
  }, []);

  const handleBulkStatusUpdate = useCallback((status: Task['status']) => {
    const taskIds = selectedTasks.map(t => t.id);
    onBulkUpdate(taskIds, { status });
  }, [selectedTasks, onBulkUpdate]);

  const handleBulkPriorityUpdate = useCallback((priority: Task['priority']) => {
    const taskIds = selectedTasks.map(t => t.id);
    onBulkUpdate(taskIds, { priority });
  }, [selectedTasks, onBulkUpdate]);

  if (selectedTasks.length === 0) {
    return null;
  }

  const singleTask = selectedTasks.length === 1 ? selectedTasks[0] : null;
  const isEditing = editingTaskId === singleTask?.id;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-800">
            {selectedTasks.length === 1 
              ? 'Task Operations' 
              : `Bulk Operations (${selectedTasks.length} tasks)`
            }
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleMultiSelect}
            className={isMultiSelectMode ? 'bg-blue-50 border-blue-300' : ''}
          >
            <CheckSquare size={16} />
            Multi-select
          </Button>
        </div>
        
        {selectedTasks.length > 1 && (
          <Badge variant="secondary">
            {selectedTasks.length} selected
          </Badge>
        )}
      </div>

      {/* Single task operations */}
      {singleTask && (
        <div className="space-y-3">
          {/* Inline title editing */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 font-medium">{singleTask.title}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInlineEdit(singleTask)}
                >
                  <Edit3 size={16} />
                </Button>
              </>
            )}
          </div>

          {/* Single task actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onTaskDuplicate(singleTask.id)}
            >
              <Copy size={16} />
              Duplicate
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* TODO: Open date picker */}}
            >
              <Calendar size={16} />
              Change Dates
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* TODO: Open assignee picker */}}
            >
              <User size={16} />
              Reassign
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link2 size={16} />
                  Create Dependency
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onTaskDelete(singleTask.id)}
                >
                  <Trash2 size={16} />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Bulk operations */}
      {selectedTasks.length > 1 && (
        <div className="space-y-3">
          {/* Bulk status update */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <div className="flex gap-1">
              {['not_started', 'in_progress', 'completed', 'on_hold'].map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate(status as Task['status'])}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Bulk priority update */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Priority:</span>
            <div className="flex gap-1">
              {['low', 'medium', 'high', 'critical'].map(priority => (
                <Button
                  key={priority}
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkPriorityUpdate(priority as Task['priority'])}
                  className="capitalize"
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {/* Other bulk operations */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* TODO: Bulk date update */}}
            >
              <Calendar size={16} />
              Update Dates
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* TODO: Bulk reassign */}}
            >
              <User size={16} />
              Reassign All
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                selectedTasks.forEach(task => onTaskDelete(task.id));
              }}
            >
              <Trash2 size={16} />
              Delete All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
