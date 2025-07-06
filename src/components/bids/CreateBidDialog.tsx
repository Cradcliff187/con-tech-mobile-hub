import { BidFormFields } from './forms/BidFormFields';
import { useBidForm } from './hooks/useBidForm';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface CreateBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimateId?: string;
  onSuccess?: () => void;
}

export const CreateBidDialog = ({ 
  open, 
  onOpenChange,
  estimateId,
  onSuccess 
}: CreateBidDialogProps) => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  } = useBidForm({
    onSuccess,
    onClose: () => onOpenChange(false),
    defaultEstimateId: estimateId
  });

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={estimateId ? "Create Bid from Estimate" : "Create New Bid"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <BidFormFields 
          formData={formData}
          onInputChange={handleInputChange}
          errors={errors}
          isFromEstimate={!!estimateId}
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
            {loading ? 'Creating...' : 'Create Bid'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};