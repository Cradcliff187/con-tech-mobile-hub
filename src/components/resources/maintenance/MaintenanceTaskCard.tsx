
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, CalendarDays } from 'lucide-react';
import { MaintenanceTask } from './types';
import { getStatusColor, getPriorityColor } from './utils';

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  onViewDetails: (task: MaintenanceTask) => void;
}

export const MaintenanceTaskCard = ({ task, onViewDetails }: MaintenanceTaskCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'in-progress': return <Clock size={16} className="text-blue-600" />;
      case 'overdue': return <AlertTriangle size={16} className="text-red-600" />;
      default: return <CalendarDays size={16} className="text-yellow-600" />;
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="font-medium text-slate-800">{task.equipmentName}</h4>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Due: {new Date(task.scheduledDate).toLocaleDateString()}</span>
            <span>{task.estimatedHours}h estimated</span>
            {task.assignedTo && <span>Assigned to: {task.assignedTo}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('-', ' ')}
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(task)}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
