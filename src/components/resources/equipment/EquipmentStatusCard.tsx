
import { AlertTriangle, CheckCircle, Clock, Wrench, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Equipment } from '@/hooks/useEquipment';

interface EquipmentStatusCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string, name: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  deletingId: string | null;
}

export const EquipmentStatusCard = ({ 
  equipment, 
  onEdit, 
  onDelete, 
  onStatusUpdate, 
  deletingId 
}: EquipmentStatusCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-use':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-orange-500" />;
      case 'available':
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <AlertTriangle size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-use':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getOperatorDisplay = (item: Equipment) => {
    if (item.assigned_operator) {
      return {
        name: item.assigned_operator.contact_person || item.assigned_operator.company_name || 'Unknown Employee',
        type: 'Employee'
      };
    } else if (item.operator) {
      return {
        name: item.operator.full_name || 'Unknown User',
        type: 'Internal User'
      };
    }
    return null;
  };

  const operatorInfo = getOperatorDisplay(equipment);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-medium text-slate-800 mb-1">
            {equipment.name}
          </h4>
          <p className="text-sm text-slate-600 mb-2">
            Type: {equipment.type || 'Unknown'}
          </p>
          <p className="text-sm text-slate-600 mb-2">
            Project: {equipment.project?.name || 'Unassigned'}
          </p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Operator:</span>
            {operatorInfo ? (
              <div className="flex items-center gap-2">
                <span>{operatorInfo.name}</span>
                <Badge variant="outline" className="text-xs">
                  {operatorInfo.type}
                </Badge>
              </div>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(equipment.status)}
          <select
            value={equipment.status}
            onChange={(e) => onStatusUpdate(equipment.id, e.target.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(equipment.status)}`}
          >
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="out-of-service">Out of Service</option>
          </select>
          
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(equipment)}
              title="Edit equipment"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              onClick={() => onDelete(equipment.id, equipment.name)}
              disabled={deletingId === equipment.id}
              title="Delete equipment"
            >
              {deletingId === equipment.id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
              ) : (
                <Trash size={14} />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Utilization</span>
            <span className="font-medium text-slate-800">{equipment.utilization_rate || 0}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(equipment.utilization_rate || 0, 100)}%` }}
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-slate-600 mb-1">Next Maintenance</p>
          <p className="text-sm font-medium text-slate-800">
            {equipment.maintenance_due 
              ? new Date(equipment.maintenance_due).toLocaleDateString()
              : 'Not scheduled'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
