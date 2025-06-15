
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, MessageSquare, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useTasks } from '@/hooks/useTasks';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';
import { useState } from 'react';

interface TaskDetailsProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId, onClose }) => {
  const { tasks } = useTasks();
  const { updates, loading: updatesLoading, addUpdate } = useTaskUpdates(taskId);
  const [newUpdate, setNewUpdate] = useState('');
  const [addingUpdate, setAddingUpdate] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Task Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">The requested task could not be found.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;

    setAddingUpdate(true);
    const { error } = await addUpdate(newUpdate, 'Current User');
    
    if (!error) {
      setNewUpdate('');
    }
    setAddingUpdate(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(task.status)}>
                {task.status.replace('-', ' ')}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.category && (
                <Badge variant="outline">{task.category}</Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600 text-sm">{task.description}</p>
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Progress</h4>
            <span className="text-sm font-medium">{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="w-full" />
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4">
          {task.start_date && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                Start Date
              </div>
              <p className="font-medium">{format(new Date(task.start_date), 'MMM dd, yyyy')}</p>
            </div>
          )}
          {task.due_date && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                Due Date
              </div>
              <p className="font-medium">{format(new Date(task.due_date), 'MMM dd, yyyy')}</p>
            </div>
          )}
        </div>

        {/* Hours */}
        {(task.estimated_hours || task.actual_hours) && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Estimated Hours
              </div>
              <p className="font-medium">{task.estimated_hours || 'Not set'}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Actual Hours
              </div>
              <p className="font-medium">{task.actual_hours || 'Not tracked'}</p>
            </div>
          </div>
        )}

        {/* Updates */}
        <div>
          <h4 className="font-medium mb-2">Task Updates</h4>
          
          {/* Add new update */}
          <div className="mb-4">
            <textarea
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              placeholder="Add an update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
              rows={3}
            />
            <Button 
              onClick={handleAddUpdate}
              disabled={!newUpdate.trim() || addingUpdate}
              size="sm"
              className="mt-2"
            >
              {addingUpdate ? 'Adding...' : 'Add Update'}
            </Button>
          </div>

          {/* Updates list */}
          {updatesLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse bg-gray-50 rounded-lg p-3 h-16"></div>
              <div className="animate-pulse bg-gray-50 rounded-lg p-3 h-16"></div>
            </div>
          ) : updates.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {updates.map((update) => (
                <div key={update.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium">{update.author_name || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(update.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{update.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No updates yet</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button size="sm" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
