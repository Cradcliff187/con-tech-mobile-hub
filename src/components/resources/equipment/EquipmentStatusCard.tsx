
import { useState } from 'react';
import { Calendar, Clock, User, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Equipment } from '@/hooks/useEquipment';
import { MaintenanceTask } from '@/hooks/useMaintenanceTasks';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface EquipmentStatusCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  deletingId?: string;
  maintenanceTasks?: MaintenanceTask[];
}

export const EquipmentStatusCard = ({
  equipment,
  onEdit,
  onDelete,
  onStatusUpdate,
  deletingId,
  maintenanceTasks = []
}: EquipmentStatusCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-use': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaintenanceStatus = () => {
    if (!equipment.maintenance_due) return null;

    const maintenanceDate = new Date(equipment.maintenance_due);
    const today = new Date();
    const warningDate = addDays(today, 7);

    if (isBefore(maintenanceDate, today)) {
      return { status: 'overdue', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    } else if (isBefore(maintenanceDate, warningDate)) {
      return { status: 'due_soon', color: 'bg-orange-100 text-orange-800', icon: Clock };
    } else {
      return { status: 'scheduled', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    }
  };

  const maintenanceStatus = getMaintenanceStatus();
  const activeTasks = maintenanceTasks.filter(task => 
    task.status === 'scheduled' || task.status === 'in_progress'
  );
  const overdueTasks = maintenanceTasks.filter(task => task.status === 'overdue');

  return (
    <div className="p-6 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-medium text-slate-900">{equipment.name}</h3>
            <Badge className={getStatusColor(equipment.status || 'available')}>
              {equipment.status || 'available'}
            </Badge>
            {equipment.type && (
              <Badge variant="outline">{equipment.type}</Badge>
            )}
            
            {/* Maintenance Status Indicators */}
            {maintenanceStatus && (
              <Badge className={maintenanceStatus.color}>
                <maintenanceStatus.icon size={12} className="mr-1" />
                {maintenanceStatus.status === 'overdue' && 'Maintenance Overdue'}
                {maintenanceStatus.status === 'due_soon' && 'Maintenance Due Soon'}
                {maintenanceStatus.status === 'scheduled' && 'Maintenance Scheduled'}
              </Badge>
            )}
            
            {overdueTasks.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle size={12} className="mr-1" />
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
            {equipment.project && (
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Project: {equipment.project.name}</span>
              </div>
            )}
            
            {equipment.operator && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Operator: {equipment.operator.full_name}</span>
              </div>
            )}
            
            {equipment.assigned_operator && (
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Assigned: {equipment.assigned_operator.contact_person}</span>
              </div>
            )}

            {equipment.maintenance_due && (
              <div className="flex items-center gap-2">
                <Wrench size={16} />
                <span>Next Maintenance: {format(new Date(equipment.maintenance_due), 'MMM dd, yyyy')}</span>
              </div>
            )}

            {activeTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{activeTasks.length} Active Task{activeTasks.length > 1 ? 's' : ''}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span>Utilization: {equipment.utilization_rate || 0}%</span>
            </div>
          </div>

          {/* Maintenance Tasks Summary */}
          {(activeTasks.length > 0 || overdueTasks.length > 0) && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Maintenance Tasks ({maintenanceTasks.length} total)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  {isExpanded ? 'Hide' : 'Show'} Details
                </Button>
              </div>
              
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {maintenanceTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.status === 'overdue' ? 'border-red-200 text-red-700' :
                            task.status === 'in_progress' ? 'border-blue-200 text-blue-700' :
                            'border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {task.status}
                        </Badge>
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <span className="text-slate-500">
                        {format(new Date(task.scheduled_date), 'MMM dd')}
                      </span>
                    </div>
                  ))}
                  {maintenanceTasks.length > 3 && (
                    <div className="text-xs text-slate-500">
                      +{maintenanceTasks.length - 3} more tasks
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(equipment)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(equipment.id)}
            disabled={deletingId === equipment.id}
          >
            {deletingId === equipment.id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
};
