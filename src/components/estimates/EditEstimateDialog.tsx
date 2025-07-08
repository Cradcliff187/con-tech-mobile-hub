import { EstimateFormFields } from './forms/EstimateFormFields';
import { useEstimateForm } from './hooks/useEstimateForm';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import type { Estimate } from '@/hooks/useEstimates';

interface EditEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
  onSuccess?: () => void;
}

export const EditEstimateDialog = ({ 
  open, 
  onOpenChange,
  estimate,
  onSuccess 
}: EditEstimateDialogProps) => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  } = useEstimateForm({
    onSuccess,
    onClose: () => onOpenChange(false),
    estimateId: estimate?.id,
    defaultData: estimate ? {
      stakeholder_id: estimate.stakeholder_id,
      title: estimate.title,
      description: estimate.description,
      amount: estimate.amount,
      labor_cost: estimate.labor_cost,
      material_cost: estimate.material_cost,
      equipment_cost: estimate.equipment_cost,
      markup_percentage: estimate.markup_percentage,
      valid_until: estimate.valid_until,
      terms_and_conditions: estimate.terms_and_conditions,
      notes: estimate.notes
    } : undefined
  });

  if (!estimate) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit Estimate - ${estimate.estimate_number}`}
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
            {loading ? 'Updating...' : 'Update Estimate'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};