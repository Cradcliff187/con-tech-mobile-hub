
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StakeholderFormFields } from './forms/StakeholderFormFields';
import { useStakeholderForm } from './hooks/useStakeholderForm';

interface CreateStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
}

export const CreateStakeholderDialog = ({ 
  open, 
  onOpenChange, 
  defaultType,
  onSuccess 
}: CreateStakeholderDialogProps) => {
  const {
    formData,
    loading,
    handleInputChange,
    handleSubmit
  } = useStakeholderForm({
    defaultType,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {formData.stakeholder_type === 'client' ? 'Client' : 'Stakeholder'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <StakeholderFormFields 
            formData={formData}
            onInputChange={handleInputChange}
            defaultType={defaultType}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Stakeholder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
