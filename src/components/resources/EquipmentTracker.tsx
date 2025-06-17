
import { useState } from 'react';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { CreateEquipmentDialog } from './CreateEquipmentDialog';
import { EditEquipmentDialog } from './EditEquipmentDialog';
import { EquipmentHeader } from './equipment/EquipmentHeader';
import { EquipmentStatusCard } from './equipment/EquipmentStatusCard';
import { EquipmentEmptyState } from './equipment/EquipmentEmptyState';
import { useEquipmentActions } from './equipment/useEquipmentActions';

export const EquipmentTracker = () => {
  const { equipment, loading, refetch } = useEquipment();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  const { deletingId, handleDelete, handleStatusUpdate } = useEquipmentActions(refetch);

  const handleEdit = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setShowEditDialog(true);
  };

  const handleAddEquipment = () => {
    setShowCreateDialog(true);
  };

  // Fixed: Updated to match the expected signature (id: string) => void
  const handleDeleteEquipment = (id: string) => {
    handleDelete(id);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading equipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <EquipmentHeader onAddEquipment={handleAddEquipment} />
        
        <div className="divide-y divide-slate-100">
          {equipment.length === 0 ? (
            <EquipmentEmptyState onAddEquipment={handleAddEquipment} />
          ) : (
            equipment.map((item) => (
              <EquipmentStatusCard
                key={item.id}
                equipment={item}
                onEdit={handleEdit}
                onDelete={handleDeleteEquipment}
                onStatusUpdate={handleStatusUpdate}
                deletingId={deletingId}
              />
            ))
          )}
        </div>
      </div>

      <CreateEquipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />

      <EditEquipmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        equipment={selectedEquipment}
        onSuccess={refetch}
      />
    </div>
  );
};
