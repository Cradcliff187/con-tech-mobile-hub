import { useState } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { AlertTriangle } from 'lucide-react';
import type { Estimate } from '@/hooks/useEstimates';

interface DeleteEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
  onDeleted?: () => void;
}

export const DeleteEstimateDialog = ({
  open,
  onOpenChange,
  estimate,
  onDeleted
}: DeleteEstimateDialogProps) => {
  const { deleteEstimate } = useEstimates();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!estimate) return;

    setLoading(true);
    try {
      const { error } = await deleteEstimate(estimate.id);
      
      if (!error) {
        onDeleted?.();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!estimate) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Estimate"
      className="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              This action cannot be undone
            </p>
            <p className="text-sm text-red-700 mt-1">
              The estimate and all associated data will be permanently deleted.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            You are about to delete:
          </p>
          <div className="bg-slate-50 p-3 rounded border">
            <p className="font-medium text-slate-900">{estimate.title}</p>
            <p className="text-sm text-slate-600">{estimate.estimate_number}</p>
            <p className="text-sm text-slate-600">
              Amount: {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(estimate.amount)}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <TouchFriendlyButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="order-2 sm:order-1"
          >
            Cancel
          </TouchFriendlyButton>
          <TouchFriendlyButton
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="order-1 sm:order-2"
          >
            {loading ? 'Deleting...' : 'Delete Estimate'}
          </TouchFriendlyButton>
        </div>
      </div>
    </ResponsiveDialog>
  );
};