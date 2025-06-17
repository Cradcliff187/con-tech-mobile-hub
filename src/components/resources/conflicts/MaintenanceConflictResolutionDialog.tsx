
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEquipment } from '@/hooks/useEquipment';
import { Calendar, Wrench, Clock } from 'lucide-react';

interface MaintenanceConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: {
    id: string;
    title: string;
    description: string;
    affectedProjects: string[];
    dueDate?: string;
  };
  onResolved: () => void;
}

export const MaintenanceConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolved
}: MaintenanceConflictResolutionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMaintenanceDate, setNewMaintenanceDate] = useState('');
  const [backupEquipmentId, setBackupEquipmentId] = useState('');
  const [maintenanceStartTime, setMaintenanceStartTime] = useState('');
  const [maintenanceEndTime, setMaintenanceEndTime] = useState('');
  const { equipment } = useEquipment();
  const { toast } = useToast();

  const equipmentName = conflict.title.split(' ')[0];
  const conflictedEquipment = equipment.find(eq => eq.name === equipmentName);
  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  const handleResolve = async () => {
    if (!selectedOption) {
      toast({
        title: "Error",
        description: "Please select a resolution option",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      switch (selectedOption) {
        case 'reschedule':
          if (!newMaintenanceDate || !conflictedEquipment) {
            throw new Error('New maintenance date not provided');
          }

          const { error: rescheduleError } = await supabase
            .from('equipment')
            .update({
              maintenance_due: newMaintenanceDate
            })
            .eq('id', conflictedEquipment.id);

          if (rescheduleError) throw rescheduleError;
          break;

        case 'backup':
          if (!backupEquipmentId || !conflictedEquipment) {
            throw new Error('Backup equipment not selected');
          }

          // Assign backup equipment to the project
          const { error: backupError } = await supabase
            .from('equipment')
            .update({
              project_id: conflictedEquipment.project_id,
              status: 'in-use'
            })
            .eq('id', backupEquipmentId);

          if (backupError) throw backupError;

          // Free up original equipment for maintenance
          const { error: freeError } = await supabase
            .from('equipment')
            .update({
              project_id: null,
              status: 'maintenance'
            })
            .eq('id', conflictedEquipment.id);

          if (freeError) throw freeError;
          break;

        case 'window':
          // Schedule maintenance during specific hours
          // This would typically integrate with a scheduling system
          console.log('Scheduling maintenance window from', maintenanceStartTime, 'to', maintenanceEndTime);
          
          if (!conflictedEquipment) {
            throw new Error('Equipment not found');
          }

          // Update equipment status to show scheduled maintenance
          const { error: windowError } = await supabase
            .from('equipment')
            .update({
              status: 'scheduled_maintenance'
            })
            .eq('id', conflictedEquipment.id);

          if (windowError) throw windowError;
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "Maintenance conflict has been resolved"
      });

      onResolved();
      onOpenChange(false);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast({
        title: "Error",
        description: "Failed to resolve conflict",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench size={20} />
            Resolve Maintenance Conflict
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Conflict Details</Label>
            <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
            {conflict.dueDate && (
              <p className="text-sm text-orange-600 mt-1">
                Due: {new Date(conflict.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Resolution Options</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reschedule" id="reschedule" />
                <Label htmlFor="reschedule" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Reschedule maintenance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="backup" id="backup" />
                <Label htmlFor="backup" className="flex items-center gap-2">
                  <Wrench size={16} />
                  Assign backup equipment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="window" id="window" />
                <Label htmlFor="window" className="flex items-center gap-2">
                  <Clock size={16} />
                  Schedule maintenance window
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedOption === 'reschedule' && (
            <div className="space-y-2">
              <Label htmlFor="maintenance-date">New Maintenance Date</Label>
              <Input
                id="maintenance-date"
                type="date"
                value={newMaintenanceDate}
                onChange={(e) => setNewMaintenanceDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {selectedOption === 'backup' && (
            <div className="space-y-2">
              <Label htmlFor="backup-equipment">Backup Equipment</Label>
              <Select value={backupEquipmentId} onValueChange={setBackupEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select backup equipment..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEquipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} - {eq.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedOption === 'window' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={maintenanceStartTime}
                    onChange={(e) => setMaintenanceStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={maintenanceEndTime}
                    onChange={(e) => setMaintenanceEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={isSubmitting || !selectedOption}
            >
              {isSubmitting ? 'Resolving...' : 'Resolve Conflict'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
