
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { Wrench, CheckSquare } from 'lucide-react';
import { Equipment } from '@/hooks/useEquipment';

interface BulkEquipmentActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment[];
  onSuccess: () => void;
}

export const BulkEquipmentActions = ({
  open,
  onOpenChange,
  equipment,
  onSuccess
}: BulkEquipmentActionsProps) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEquipmentToggle = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment(prev => [...prev, equipmentId]);
    } else {
      setSelectedEquipment(prev => prev.filter(id => id !== equipmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEquipment(equipment.map(eq => eq.id));
    } else {
      setSelectedEquipment([]);
    }
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one equipment item",
        variant: "destructive"
      });
      return;
    }

    if (!bulkAction) {
      toast({
        title: "Error",
        description: "Please select an action",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      switch (bulkAction) {
        case 'update_status':
          if (!newStatus) {
            throw new Error('Please select a new status');
          }
          
          const { error: statusError } = await supabase
            .from('equipment')
            .update({ status: newStatus })
            .in('id', selectedEquipment);

          if (statusError) throw statusError;
          break;

        case 'release_all':
          const { error: releaseError } = await supabase
            .from('equipment')
            .update({
              project_id: null,
              status: 'available',
              operator_id: null,
              assigned_operator_id: null
            })
            .in('id', selectedEquipment);

          if (releaseError) throw releaseError;
          break;

        case 'schedule_maintenance':
          const maintenanceDate = new Date();
          maintenanceDate.setDate(maintenanceDate.getDate() + 30); // 30 days from now
          
          const { error: maintenanceError } = await supabase
            .from('equipment')
            .update({
              maintenance_due: maintenanceDate.toISOString().split('T')[0],
              status: 'maintenance'
            })
            .in('id', selectedEquipment);

          if (maintenanceError) throw maintenanceError;
          break;

        default:
          throw new Error('Invalid bulk action');
      }

      toast({
        title: "Success",
        description: `Bulk action applied to ${selectedEquipment.length} equipment item(s)`
      });

      setSelectedEquipment([]);
      setBulkAction('');
      setNewStatus('');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform bulk action",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Bulk Equipment Actions"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Equipment Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base font-semibold">Select Equipment</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all"
                checked={selectedEquipment.length === equipment.length && equipment.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm">Select All</Label>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-2 border rounded p-3">
            {equipment.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                <Checkbox
                  id={item.id}
                  checked={selectedEquipment.includes(item.id)}
                  onCheckedChange={(checked) => handleEquipmentToggle(item.id, Boolean(checked))}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-slate-500 flex-shrink-0" />
                    <span className="font-medium truncate">{item.name}</span>
                    <GlobalStatusDropdown
                      entityType="equipment"
                      currentStatus={item.status}
                      onStatusChange={() => {}}
                      showAsDropdown={false}
                      size="sm"
                    />
                  </div>
                  <p className="text-sm text-slate-500 truncate">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
          
          {selectedEquipment.length > 0 && (
            <p className="text-sm text-slate-600 mt-2">
              {selectedEquipment.length} equipment item(s) selected
            </p>
          )}
        </div>

        {/* Action Selection */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Bulk Action</Label>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select an action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update_status">Update Status</SelectItem>
              <SelectItem value="release_all">Release from Projects</SelectItem>
              <SelectItem value="schedule_maintenance">Schedule Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Selection (only shown when updating status) */}
        {bulkAction === 'update_status' && (
          <div>
            <Label className="text-base font-semibold mb-3 block">New Status</Label>
            <GlobalStatusDropdown
              entityType="equipment"
              currentStatus={newStatus}
              onStatusChange={setNewStatus}
              size="md"
              className="w-full"
            />
          </div>
        )}

        {/* Action Confirmation */}
        {bulkAction && selectedEquipment.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckSquare size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-800">Confirm Bulk Action</p>
                <p className="text-sm text-slate-600">
                  {bulkAction === 'update_status' && `Update status for ${selectedEquipment.length} equipment item(s)`}
                  {bulkAction === 'release_all' && `Release ${selectedEquipment.length} equipment item(s) from their current projects`}
                  {bulkAction === 'schedule_maintenance' && `Schedule maintenance for ${selectedEquipment.length} equipment item(s) in 30 days`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <TouchFriendlyButton
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton
            onClick={handleSubmit}
            disabled={isSubmitting || selectedEquipment.length === 0 || !bulkAction || (bulkAction === 'update_status' && !newStatus)}
            className="order-1 sm:order-2"
          >
            {isSubmitting ? 'Processing...' : 'Apply Bulk Action'}
          </TouchFriendlyButton>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
