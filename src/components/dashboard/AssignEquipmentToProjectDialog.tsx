
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useEquipment } from '@/hooks/useEquipment';
import { useStakeholders } from '@/hooks/useStakeholders';
import { DateRangeSelector } from './equipment/DateRangeSelector';
import { EquipmentSelector } from './equipment/EquipmentSelector';
import { useAssignEquipmentDialog } from './equipment/useAssignEquipmentDialog';
import type { Project } from '@/types/database';

interface AssignEquipmentToProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AssignEquipmentToProjectDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess
}: AssignEquipmentToProjectDialogProps) => {
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { stakeholders } = useStakeholders();
  
  const {
    selectedEquipment,
    startDate,
    endDate,
    operatorAssignments,
    availabilityCheck,
    isSubmitting,
    resetForm,
    handleEquipmentToggle,
    handleOperatorAssignment,
    handleSubmit,
    setStartDate,
    setEndDate
  } = useAssignEquipmentDialog(project, onSuccess, () => onOpenChange(false));

  const availableOperators = stakeholders.filter(s => 
    s.stakeholder_type === 'employee' && s.status === 'active'
  );

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Equipment to {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />

          <EquipmentSelector
            equipment={equipment}
            loading={equipmentLoading}
            selectedEquipment={selectedEquipment}
            availabilityCheck={availabilityCheck}
            operatorAssignments={operatorAssignments}
            startDate={startDate}
            endDate={endDate}
            availableOperators={availableOperators}
            onEquipmentToggle={handleEquipmentToggle}
            onOperatorAssignment={handleOperatorAssignment}
          />

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                selectedEquipment.length === 0 || 
                !startDate || 
                !endDate ||
                selectedEquipment.some(id => availabilityCheck[id] === false)
              }
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Allocating...' : `Allocate ${selectedEquipment.length} Equipment`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
