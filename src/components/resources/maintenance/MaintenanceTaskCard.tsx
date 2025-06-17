
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, CalendarDays } from 'lucide-react';
import { MaintenanceTask } from '@/types/maintenance';
import { getStatusColor, getPriorityColor } from './utils';

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onStatusUpdate?: (taskId: string, newStatus: string) => void;
}

export const MaintenanceTaskCard = ({ task, onStatusUpdate }: MaintenanceTaskCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress': return <Clock size={16} className="text-blue-600" />;
      case 'overdue': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <CalendarDays size={16} className="text-yellow-600" />;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(task.id, newStatus);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="font-medium text-slate-800">{task.equipment?.name || 'Unknown Equipment'}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-2">{task.title}</p>
          {task.description && (
            <p className="text-sm text-slate-500 mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Due: {new Date(task.scheduled_date).toLocaleDateString()}</span>
            <span>{task.estimated_hours || 4}h estimated</span>
            {(task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name) && (
              <span>Assigned to: {task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('_', ' ')}
          </Badge>
          {task.status === 'scheduled' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange('in_progress')}
            >
              Start
            </Button>
          )}
          {task.status === 'in_progress' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleStatusChange('completed')}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
