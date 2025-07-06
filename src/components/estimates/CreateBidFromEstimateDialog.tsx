import { CreateBidDialog } from '@/components/bids/CreateBidDialog';
import type { Estimate } from '@/hooks/useEstimates';

interface CreateBidFromEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
  onSuccess?: () => void;
}

export const CreateBidFromEstimateDialog = ({ 
  open, 
  onOpenChange,
  estimate,
  onSuccess 
}: CreateBidFromEstimateDialogProps) => {
  if (!estimate) return null;

  return (
    <CreateBidDialog
      open={open}
      onOpenChange={onOpenChange}
      estimateId={estimate.id}
      onSuccess={onSuccess}
    />
  );
};