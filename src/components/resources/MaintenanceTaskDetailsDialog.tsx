
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, User, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/useMaintenanceTasks';

interface MaintenanceTaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: MaintenanceTask | null;
}

export const MaintenanceTaskDetailsDialog = ({ 
  open, 
  onOpenChange, 
  task 
}: MaintenanceTaskDetailsDialogProps) => {
  if (!task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-green-600" />;
      case 'in_progress': return <Clock size={20} className="text-blue-600" />;
      case 'overdue': return <AlertTriangle size={20} className="text-red-600" />;
      default: return <CalendarDays size={20} className="text-yellow-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'routine': return 'Routine Maintenance';
      case 'repair': return 'Repair Work';
      case 'inspection': return 'Safety Inspection';
      default: return type;
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Maintenance Details: ${task.equipment?.name || 'Unknown Equipment'}`}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Status and Priority Overview */}
        <div className="flex items-center gap-4">
          {getStatusIcon(task.status)}
          <div className="flex-1">
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={`ml-2 ${getPriorityColor(task.priority)}`}>
              {task.priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>

        {/* Equipment Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="text-blue-600" size={20} />
              Equipment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Equipment Name</label>
                <p className="text-slate-800 font-medium">{task.equipment?.name || 'Unknown Equipment'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Equipment ID</label>
                <p className="text-slate-800 font-mono text-sm">{task.equipment_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="text-green-600" size={20} />
              Maintenance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Maintenance Type</label>
                <p className="text-slate-800 font-medium">{getTypeLabel(task.task_type)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Scheduled Date</label>
                <p className="text-slate-800 font-medium">
                  {new Date(task.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Estimated Duration</label>
                <p className="text-slate-800 font-medium flex items-center gap-1">
                  <Clock size={16} />
                  {task.estimated_hours || 4} hours
                </p>
              </div>
              {(task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name) && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Assigned To</label>
                  <p className="text-slate-800 font-medium flex items-center gap-1">
                    <User size={16} />
                    {task.assigned_stakeholder?.contact_person || task.assigned_user?.full_name}
                  </p>
                </div>
              )}
            </div>
            
            {task.description && (
              <div>
                <label className="text-sm font-medium text-slate-600">Description</label>
                <p className="text-slate-800 mt-1">{task.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Ensure all safety protocols are followed during maintenance</p>
              <p>• Document any issues or concerns discovered during the work</p>
              <p>• Update equipment status upon completion</p>
              {task.task_type === 'inspection' && (
                <p>• Complete inspection checklist and certification requirements</p>
              )}
              {task.priority === 'critical' && (
                <p className="text-red-600 font-medium">• CRITICAL: This maintenance requires immediate attention</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveDialog>
  );
};
