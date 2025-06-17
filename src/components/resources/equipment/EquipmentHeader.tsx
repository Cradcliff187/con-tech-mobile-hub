
import { Plus, Upload, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EquipmentHeaderProps {
  onAddEquipment: () => void;
  onImportEquipment: () => void;
  onBulkActions: () => void;
  onQuickAllocation?: () => void;
  selectedCount?: number;
}

export const EquipmentHeader = ({
  onAddEquipment,
  onImportEquipment,
  onBulkActions,
  onQuickAllocation,
  selectedCount = 0
}: EquipmentHeaderProps) => {
  return (
    <div className="p-6 border-b border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Equipment Tracker</h2>
          <p className="text-slate-600">Manage your equipment inventory and allocations</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Allocation Button - only show when equipment is selected */}
          {onQuickAllocation && selectedCount === 1 && (
            <Button
              onClick={onQuickAllocation}
              variant="outline"
              size="sm"
              className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Zap size={16} />
              Quick Allocate
            </Button>
          )}

          {/* Bulk Actions - show count when items selected */}
          <Button
            onClick={onBulkActions}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Settings size={16} />
            Bulk Actions
            {selectedCount > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs px-1.5 py-0.5 rounded">
                {selectedCount}
              </span>
            )}
          </Button>
          
          <Button
            onClick={onImportEquipment}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Upload size={16} />
            Import
          </Button>
          
          <Button
            onClick={onAddEquipment}
            className="bg-orange-600 hover:bg-orange-700 gap-2"
            size="sm"
          >
            <Plus size={16} />
            Add Equipment
          </Button>
        </div>
      </div>
    </div>
  );
};
