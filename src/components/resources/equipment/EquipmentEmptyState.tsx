
import { Wrench, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentEmptyStateProps {
  onAddEquipment: () => void;
}

export const EquipmentEmptyState = ({ onAddEquipment }: EquipmentEmptyStateProps) => {
  return (
    <div className="p-6 text-center">
      <Wrench size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-medium text-slate-600 mb-2">No Equipment Found</h3>
      <p className="text-slate-500 mb-4">Add equipment to track utilization and maintenance</p>
      <Button onClick={onAddEquipment}>
        <Plus size={16} className="mr-2" />
        Add First Equipment
      </Button>
    </div>
  );
};
