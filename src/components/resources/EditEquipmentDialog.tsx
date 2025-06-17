
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Equipment } from '@/hooks/useEquipment';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EquipmentFormFields } from './equipment/EquipmentFormFields';
import { ProjectAssignmentField } from './equipment/ProjectAssignmentField';
import { OperatorAssignmentField } from './equipment/OperatorAssignmentField';
import { useEquipmentForm } from './equipment/useEquipmentForm';

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess?: () => void;
}

export const EditEquipmentDialog = ({ open, onOpenChange, equipment, onSuccess }: EditEquipmentDialogProps) => {
  const {
    name, setName,
    type, setType,
    status, setStatus,
    projectId, setProjectId,
    operatorType, setOperatorType,
    assignedOperatorId, setAssignedOperatorId,
    operatorId, setOperatorId,
    maintenanceDue, setMaintenanceDue,
    handleSubmit,
    handleOpenChange,
    updateOperation
  } = useEquipmentForm({ equipment, open, onSuccess, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <EquipmentFormFields
            name={name}
            setName={setName}
            type={type}
            setType={setType}
            status={status}
            setStatus={setStatus}
            maintenanceDue={maintenanceDue}
            setMaintenanceDue={setMaintenanceDue}
            disabled={updateOperation.loading}
          />

          <ProjectAssignmentField
            projectId={projectId}
            setProjectId={setProjectId}
            disabled={updateOperation.loading}
          />

          <OperatorAssignmentField
            operatorType={operatorType}
            setOperatorType={setOperatorType}
            assignedOperatorId={assignedOperatorId}
            setAssignedOperatorId={setAssignedOperatorId}
            operatorId={operatorId}
            setOperatorId={setOperatorId}
            disabled={updateOperation.loading}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={updateOperation.loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateOperation.loading || !name.trim() || !type.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateOperation.loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
