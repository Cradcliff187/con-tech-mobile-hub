import { useState } from 'react';
import { useBids } from '@/hooks/useBids';
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';
import { AlertTriangle } from 'lucide-react';
import type { Bid } from '@/hooks/useBids';

interface DeleteBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
  onDeleted?: () => void;
}

export const DeleteBidDialog = ({
  open,
  onOpenChange,
  bid,
  onDeleted
}: DeleteBidDialogProps) => {
  const { deleteBid } = useBids();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!bid) return;

    setLoading(true);
    try {
      const { error } = await deleteBid(bid.id);
      
      if (!error) {
        onDeleted?.();
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!bid) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const hasImpacts = bid.project_id || bid.estimate_id;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Bid"
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
              The bid and all associated data will be permanently deleted.
            </p>
          </div>
        </div>

        {hasImpacts && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              Impact Warning
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              {bid.estimate_id && (
                <li>• This bid is linked to estimate {bid.estimate?.estimate_number}</li>
              )}
              {bid.project_id && (
                <li>• This bid was converted to project: {bid.project?.name}</li>
              )}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            You are about to delete:
          </p>
          <div className="bg-slate-50 p-3 rounded border">
            <p className="font-medium text-slate-900">{bid.bid_number}</p>
            <p className="text-sm text-slate-600">
              Amount: {formatCurrency(bid.bid_amount)}
            </p>
            <p className="text-sm text-slate-600">
              Status: {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </p>
            {bid.stakeholder && (
              <p className="text-sm text-slate-600">
                Client: {bid.stakeholder.company_name || bid.stakeholder.contact_person}
              </p>
            )}
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
            {loading ? 'Deleting...' : 'Delete Bid'}
          </TouchFriendlyButton>
        </div>
      </div>
    </ResponsiveDialog>
  );
};