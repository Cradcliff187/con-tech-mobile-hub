
import { Label } from '@/components/ui/label';
import { Wrench } from 'lucide-react';
import { EquipmentCard } from './EquipmentCard';
import type { Equipment } from '@/hooks/useEquipment';

interface EquipmentSelectorProps {
  equipment: Equipment[];
  loading: boolean;
  selectedEquipment: string[];
  availabilityCheck: Record<string, boolean>;
  operatorAssignments: Record<string, string>;
  startDate: string;
  endDate: string;
  availableOperators: Array<{
    id: string;
    contact_person?: string;
    company_name?: string;
  }>;
  onEquipmentToggle: (equipmentId: string, checked: boolean) => void;
  onOperatorAssignment: (equipmentId: string, operatorId: string) => void;
}

export const EquipmentSelector = ({
  equipment,
  loading,
  selectedEquipment,
  availabilityCheck,
  operatorAssignments,
  startDate,
  endDate,
  availableOperators,
  onEquipmentToggle,
  onOperatorAssignment
}: EquipmentSelectorProps) => {
  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Available Equipment</Label>
      {loading ? (
        <div className="text-center py-8">Loading equipment...</div>
      ) : availableEquipment.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
          <p>No available equipment to allocate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {availableEquipment.map((eq) => {
            const isSelected = selectedEquipment.includes(eq.id);
            const availabilityValue = availabilityCheck[eq.id];
            const isAvailable = availabilityValue !== undefined ? Boolean(availabilityValue) : undefined;
            const showAvailabilityCheck = isSelected && startDate && endDate;

            return (
              <EquipmentCard
                key={eq.id}
                equipment={eq}
                isSelected={isSelected}
                isAvailable={isAvailable}
                showAvailabilityCheck={showAvailabilityCheck}
                operatorId={operatorAssignments[eq.id]}
                availableOperators={availableOperators}
                onToggle={(checked) => onEquipmentToggle(eq.id, checked)}
                onOperatorChange={(operatorId) => onOperatorAssignment(eq.id, operatorId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
