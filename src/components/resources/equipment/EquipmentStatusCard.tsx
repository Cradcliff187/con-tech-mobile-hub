
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EquipmentAllocationTimeline } from './EquipmentAllocationTimeline';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { Equipment } from '@/hooks/useEquipment';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar, 
  Edit, 
  MapPin, 
  MoreVertical, 
  Settings, 
  Trash2, 
  User, 
  Wrench,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EquipmentStatusCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
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
  const [showActions, setShowActions] = useState(false);
  const [showAllocations, setShowAllocations] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();
  
  const { allocations, loading: allocationsLoading, deleteAllocation } = useEquipmentAllocations(equipment.id);

  const isDeleting = deletingId === equipment.id;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'in-use': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'out-of-service': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await onStatusUpdate(equipment.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRemoveAllocation = async (allocationId: string) => {
    try {
      const { error } = await deleteAllocation(allocationId);
      if (error) throw error;

      // If this was the only allocation, update equipment status to available
      const remainingAllocations = allocations.filter(a => a.id !== allocationId);
      if (remainingAllocations.length === 0 && equipment.status === 'in-use') {
        await handleStatusChange('available');
      }

      toast({
        title: "Success",
        description: "Equipment allocation removed"
      });
    } catch (error) {
      console.error('Error removing allocation:', error);
      toast({
        title: "Error",
        description: "Failed to remove allocation",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">{equipment.name}</h3>
              <Badge className={getStatusColor(equipment.status)}>
                {equipment.status}
              </Badge>
            </div>
            <p className="text-slate-600">{equipment.type}</p>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <MoreVertical size={16} />
              )}
            </Button>

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg p-1 z-10 min-w-[120px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onEdit(equipment);
                    setShowActions(false);
                  }}
                >
                  <Edit size={14} className="mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => {
                    onDelete(equipment.id);
                    setShowActions(false);
                  }}
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {equipment.project && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" />
              <span>Project: {equipment.project.name}</span>
            </div>
          )}

          {(equipment.operator || equipment.assigned_operator) && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span>
                Operator: {equipment.operator?.full_name || equipment.assigned_operator?.contact_person || 'Assigned'}
              </span>
            </div>
          )}

          {equipment.maintenance_due && (
            <div className="flex items-center gap-2">
              <Settings size={14} className="text-slate-400" />
              <span>
                Maintenance Due: {new Date(equipment.maintenance_due).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Wrench size={14} className="text-slate-400" />
            <span>Utilization: {equipment.utilization_rate}%</span>
          </div>
        </div>

        {/* Status Update */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status:</span>
          <Select
            value={equipment.status}
            onValueChange={handleStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="out-of-service">Out of Service</SelectItem>
            </SelectContent>
          </Select>
          {updatingStatus && <LoadingSpinner size="sm" />}
        </div>

        {/* Allocations Timeline */}
        {allocations.length > 0 && (
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllocations(!showAllocations)}
              className="flex items-center gap-2 mb-3"
            >
              <Calendar size={14} />
              <span>Allocations ({allocations.length})</span>
              {showAllocations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>

            {showAllocations && (
              <EquipmentAllocationTimeline
                allocations={allocations}
                onRemoveAllocation={handleRemoveAllocation}
                isLoading={allocationsLoading}
              />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
