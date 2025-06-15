
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useTaskUpdates } from '@/hooks/useTaskUpdates';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Clock, User } from 'lucide-react';

interface TaskDetailsProps {
  taskId: string;
  task: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    assignee_id?: string;
    assigned_stakeholder_id?: string;
  };
}

export const TaskDetails = ({ taskId, task }: TaskDetailsProps) => {
  const { updates, loading: updatesLoading, addUpdate } = useTaskUpdates(taskId);
  const { user, profile } = useAuth();
  const [newUpdate, setNewUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeName, setAssigneeName] = useState<string>('');

  useEffect(() => {
    fetchAssigneeName();
  }, [task.assignee_id, task.assigned_stakeholder_id]);

  const fetchAssigneeName = async () => {
    try {
      if (task.assignee_id) {
        const { data: assignee } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', task.assignee_id)
          .single();
        
        setAssigneeName(assignee?.full_name || assignee?.email || 'Unknown User');
      } else if (task.assigned_stakeholder_id) {
        const { data: stakeholder } = await supabase
          .from('stakeholders')
          .select('contact_person, company_name')
          .eq('id', task.assigned_stakeholder_id)
          .single();
        
        setAssigneeName(stakeholder?.contact_person || stakeholder?.company_name || 'Unknown Stakeholder');
      } else {
        setAssigneeName('Unassigned');
      }
    } catch (error) {
      console.error('Error fetching assignee name:', error);
      setAssigneeName('Unknown');
    }
  };

  const handleSubmitUpdate = async () => {
    if (!newUpdate.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const authorName = profile?.full_name || profile?.email || user.email || 'Unknown User';
      
      await addUpdate(newUpdate, user.id, authorName);
      setNewUpdate('');
    } catch (error) {
      console.error('Error adding task update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(task.status)}>
              {task.status.replace('-', ' ')}
            </Badge>
            <Badge variant={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {task.description && (
            <p className="text-slate-600 mb-4">{task.description}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-700">Assigned to:</span>
              <p className="text-slate-600">{assigneeName}</p>
            </div>
            {task.due_date && (
              <div>
                <span className="font-medium text-slate-700">Due date:</span>
                <p className="text-slate-600">{new Date(task.due_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            Updates & Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updatesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
              </div>
            ) : updates.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No updates yet</p>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="border-l-4 border-orange-200 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {update.author_name || 'Unknown User'}
                    </span>
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(update.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600">{update.message}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Textarea
              placeholder="Add an update or comment..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitUpdate}
              disabled={!newUpdate.trim() || isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Adding...' : 'Add Update'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
