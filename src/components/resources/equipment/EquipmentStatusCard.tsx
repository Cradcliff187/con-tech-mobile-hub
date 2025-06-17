
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Wrench, Calendar, MoreVertical, Edit, Trash2, User, History } from 'lucide-react';
import { AllocationStatus } from './AllocationStatus';
import { EquipmentAssignmentHistoryComponent } from './EquipmentAssignmentHistory';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Equipment } from '@/hooks/useEquipment';

interface EquipmentStatusCardProps {
  equipment: Equipment;
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  deletingId?: string;
}

export const EquipmentStatusCard = ({
  equipment,
  onEdit,
  onDelete,
  onStatusUpdate,
  deletingId
}: EquipmentStatusCardProps) => {
  const { allocations } = useEquipmentAllocations(equipment.id);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const isMobile = useIsMobile();
  
  const currentAllocation = allocations.find(a => 
    new Date(a.start_date) <= new Date() && new Date() <= new Date(a.end_date)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-orange-100 text-orange-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isMaintenanceDue = equipment.maintenance_due && 
    new Date(equipment.maintenance_due) <= new Date();

  return (
    <>
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Wrench className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{equipment.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    <Badge className={getStatusColor(equipment.status || 'available')}>
                      {equipment.status}
                    </Badge>
                    {isMaintenanceDue && (
                      <Badge variant="destructive">Maintenance Due</Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 truncate">{equipment.type}</p>
                
                {/* Allocation Status */}
                <AllocationStatus allocation={currentAllocation} compact />
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 flex-shrink-0" />
                    <span>Utilization: {equipment.utilization_rate || 0}%</span>
                  </div>
                  {equipment.maintenance_due && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Maintenance: {equipment.maintenance_due}</span>
                    </div>
                  )}
                </div>

                {/* History Button */}
                <div className="mt-3">
                  <TouchFriendlyButton
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistoryDialog(true)}
                    className="text-xs w-full sm:w-auto"
                  >
                    <History className="h-3 w-3 mr-1" />
                    View History
                  </TouchFriendlyButton>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <TouchFriendlyButton variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </TouchFriendlyButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem onClick={() => onEdit(equipment)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Equipment
                </DropdownMenuItem>
                {equipment.status === 'available' && (
                  <DropdownMenuItem onClick={() => onStatusUpdate(equipment.id, 'maintenance')}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Mark for Maintenance
                  </DropdownMenuItem>
                )}
                {equipment.status === 'maintenance' && (
                  <DropdownMenuItem onClick={() => onStatusUpdate(equipment.id, 'available')}>
                    <Wrench className="h-4 w-4 mr-2" />
                    Mark Available
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete(equipment.id)}
                  className="text-red-600"
                  disabled={deletingId === equipment.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deletingId === equipment.id ? 'Deleting...' : 'Delete'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Assignment History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh]' : 'max-w-3xl max-h-[80vh]'} overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle>Assignment History - {equipment.name}</DialogTitle>
          </DialogHeader>
          <EquipmentAssignmentHistoryComponent equipmentId={equipment.id} />
        </DialogContent>
      </Dialog>
    </>
  );
};
