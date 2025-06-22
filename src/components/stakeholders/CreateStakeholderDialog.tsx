
import { StakeholderFormFields } from './forms/StakeholderFormFields';
import { useStakeholderForm } from './hooks/useStakeholderForm';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface CreateStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
}

export const CreateStakeholderDialog = ({ 
  open, 
  onOpenChange, 
  defaultType = 'subcontractor',
  onSuccess 
}: CreateStakeholderDialogProps) => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  } = useStakeholderForm({
    defaultType,
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Add New ${formData.stakeholder_type === 'client' ? 'Client' : 'Stakeholder'}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <StakeholderFormFields 
          formData={formData}
          onInputChange={handleInputChange}
          defaultType={defaultType}
          errors={errors}
        />
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <TouchFriendlyButton 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton 
            type="submit" 
            disabled={loading}
            className="order-1 sm:order-2"
          >
            {loading ? 'Creating...' : 'Create Stakeholder'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};
