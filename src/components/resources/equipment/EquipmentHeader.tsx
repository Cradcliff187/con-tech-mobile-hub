
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentHeaderProps {
  onAddEquipment: () => void;
  onImportEquipment: () => void;
}

export const EquipmentHeader = ({ onAddEquipment, onImportEquipment }: EquipmentHeaderProps) => {
  return (
    <div className="p-6 border-b border-slate-200 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">Equipment Status</h3>
      <div className="flex items-center gap-2">
        <Button onClick={onImportEquipment} variant="outline" size="sm">
          <Upload size={16} className="mr-2" />
          Import Equipment
        </Button>
        <Button onClick={onAddEquipment} size="sm">
          <Plus size={16} className="mr-2" />
          Add Equipment
        </Button>
      </div>
    </div>
  );
};
