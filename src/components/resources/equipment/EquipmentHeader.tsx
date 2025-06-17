
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { Plus, Upload, Settings, Wrench } from 'lucide-react';

interface EquipmentHeaderProps {
  onAddEquipment: () => void;
  onImportEquipment: () => void;
  onBulkActions?: () => void;
}

export const EquipmentHeader = ({ 
  onAddEquipment, 
  onImportEquipment,
  onBulkActions 
}: EquipmentHeaderProps) => {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wrench size={20} />
            Equipment Management
          </CardTitle>
          <p className="text-sm text-slate-600">
            Track and manage construction equipment, assignments, and maintenance
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {onBulkActions && (
            <TouchFriendlyButton
              variant="outline"
              onClick={onBulkActions}
              className="order-3 sm:order-1"
            >
              <Settings size={16} className="mr-2" />
              Bulk Actions
            </TouchFriendlyButton>
          )}
          <TouchFriendlyButton
            variant="outline"
            onClick={onImportEquipment}
            className="order-2 sm:order-2"
          >
            <Upload size={16} className="mr-2" />
            Import
          </TouchFriendlyButton>
          <TouchFriendlyButton
            onClick={onAddEquipment}
            className="bg-orange-600 hover:bg-orange-700 order-1 sm:order-3"
          >
            <Plus size={16} className="mr-2" />
            Add Equipment
          </TouchFriendlyButton>
        </div>
      </div>
    </CardHeader>
  );
};
