import { BidFormFields } from './forms/BidFormFields';
import { useBidForm } from './hooks/useBidForm';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import type { Bid } from '@/hooks/useBids';

interface EditBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
  onSuccess?: () => void;
}

export const EditBidDialog = ({ 
  open, 
  onOpenChange,
  bid,
  onSuccess 
}: EditBidDialogProps) => {
  const {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit
  } = useBidForm({
    onSuccess,
    onClose: () => onOpenChange(false),
    defaultData: bid ? {
      estimate_id: bid.estimate_id,
      bid_amount: bid.bid_amount,
      status: bid.status,
      submission_date: bid.submission_date,
      decision_date: bid.decision_date,
      win_probability: bid.win_probability,
      competitor_count: bid.competitor_count,
      estimated_competition_range_low: bid.estimated_competition_range_low,
      estimated_competition_range_high: bid.estimated_competition_range_high,
      win_loss_reason: bid.win_loss_reason,
      notes: bid.notes
    } : undefined
  });

  if (!bid) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Edit Bid - ${bid.bid_number}`}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <BidFormFields 
          formData={formData}
          onInputChange={handleInputChange}
          errors={errors}
          isFromEstimate={!!bid.estimate_id}
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
            {loading ? 'Updating...' : 'Update Bid'}
          </TouchFriendlyButton>
        </div>
      </form>
    </ResponsiveDialog>
  );
};