import { EstimateFormFields } from './forms/EstimateFormFields';
import { useEstimateForm } from './hooks/useEstimateForm';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface CreateEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateEstimateDialog = ({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateEstimateDialogProps) => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  } = useEstimateForm({
    onSuccess,
    onClose: () => onOpenChange(false)
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create New Estimate"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <EstimateFormFields 
          formData={formData}
          onInputChange={handleInputChange}
          errors={errors}
        />
        
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
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
            {loading ? 'Creating...' : 'Create Estimate'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};