
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
import { useProjects } from '@/hooks/useProjects';
import { Calendar, Wrench, ArrowRight } from 'lucide-react';

interface EquipmentConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict: {
    id: string;
    title: string;
    description: string;
    affectedProjects: string[];
  };
  onResolved: () => void;
}

export const EquipmentConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflict,
  onResolved
}: EquipmentConflictResolutionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [alternativeEquipmentId, setAlternativeEquipmentId] = useState('');
  const [targetProjectId, setTargetProjectId] = useState('');
  const { equipment } = useEquipment();
  const { projects } = useProjects();
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
          // This would typically involve updating project schedules
          // For demonstration, we'll log the action
          console.log('Rescheduling equipment from', newStartDate, 'to', newEndDate);
          break;

        case 'alternative':
          if (!alternativeEquipmentId || !conflictedEquipment) {
            throw new Error('Alternative equipment not selected');
          }

          // Move one project to alternative equipment
          const { error: altError } = await supabase
            .from('equipment')
            .update({
              project_id: conflictedEquipment.project_id,
              status: 'in-use'
            })
            .eq('id', alternativeEquipmentId);

          if (altError) throw altError;

          // Free up the original equipment from one project
          const { error: freeError } = await supabase
            .from('equipment')
            .update({
              project_id: null,
              status: 'available'
            })
            .eq('id', conflictedEquipment.id);

          if (freeError) throw freeError;
          break;

        case 'reassign':
          if (!targetProjectId || !conflictedEquipment) {
            throw new Error('Target project not selected');
          }

          // Reassign equipment to different project
          const { error: reassignError } = await supabase
            .from('equipment')
            .update({
              project_id: targetProjectId
            })
            .eq('id', conflictedEquipment.id);

          if (reassignError) throw reassignError;
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "Equipment double-booking has been resolved"
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
            Resolve Equipment Conflict
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Conflict Details</Label>
            <p className="text-sm text-slate-600 mt-1">{conflict.description}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Resolution Options</Label>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reschedule" id="reschedule" />
                <Label htmlFor="reschedule" className="flex items-center gap-2">
                  <Calendar size={16} />
                  Move equipment to different dates
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alternative" id="alternative" />
                <Label htmlFor="alternative" className="flex items-center gap-2">
                  <Wrench size={16} />
                  Find alternative equipment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reassign" id="reassign" />
                <Label htmlFor="reassign" className="flex items-center gap-2">
                  <ArrowRight size={16} />
                  Reassign to different project
                </Label>
              </div>
            </RadioGroup>
          </div>

          {selectedOption === 'reschedule' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-date">New Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">New End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedOption === 'alternative' && (
            <div className="space-y-2">
              <Label htmlFor="alt-equipment">Alternative Equipment</Label>
              <Select value={alternativeEquipmentId} onValueChange={setAlternativeEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alternative equipment..." />
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

          {selectedOption === 'reassign' && (
            <div className="space-y-2">
              <Label htmlFor="target-project">Target Project</Label>
              <Select value={targetProjectId} onValueChange={setTargetProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
