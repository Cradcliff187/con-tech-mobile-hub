import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Estimate } from '@/hooks/useEstimates';

interface EstimatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate | null;
}

export const EstimatePreviewDialog = ({
  open,
  onOpenChange,
  estimate
}: EstimatePreviewDialogProps) => {
  if (!estimate) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: Estimate['status']) => {
    const variants = {
      draft: 'bg-slate-100 text-slate-700',
      sent: 'bg-blue-100 text-blue-700',
      viewed: 'bg-purple-100 text-purple-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      expired: 'bg-orange-100 text-orange-700'
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Estimate Preview"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            {estimate.title}
          </h2>
          <p className="text-lg font-mono text-slate-600">
            {estimate.estimate_number}
          </p>
          {getStatusBadge(estimate.status)}
        </div>

        <Separator />

        {/* Client Information */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate-900">Client Information</h3>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="font-medium">
              {estimate.stakeholder?.company_name || estimate.stakeholder?.contact_person}
            </p>
            {estimate.stakeholder?.contact_person && estimate.stakeholder?.company_name && (
              <p className="text-slate-600">{estimate.stakeholder.contact_person}</p>
            )}
            {estimate.stakeholder?.email && (
              <p className="text-slate-600">{estimate.stakeholder.email}</p>
            )}
          </div>
        </div>

        {/* Project Description */}
        {estimate.description && (
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Project Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap">
              {estimate.description}
            </p>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Cost Breakdown</h3>
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            {estimate.labor_cost && estimate.labor_cost > 0 && (
              <div className="flex justify-between">
                <span>Labor:</span>
                <span>{formatCurrency(estimate.labor_cost)}</span>
              </div>
            )}
            {estimate.material_cost && estimate.material_cost > 0 && (
              <div className="flex justify-between">
                <span>Materials:</span>
                <span>{formatCurrency(estimate.material_cost)}</span>
              </div>
            )}
            {estimate.equipment_cost && estimate.equipment_cost > 0 && (
              <div className="flex justify-between">
                <span>Equipment:</span>
                <span>{formatCurrency(estimate.equipment_cost)}</span>
              </div>
            )}
            
            {(estimate.labor_cost || estimate.material_cost || estimate.equipment_cost) && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(
                      (estimate.labor_cost || 0) + 
                      (estimate.material_cost || 0) + 
                      (estimate.equipment_cost || 0)
                    )}
                  </span>
                </div>
              </>
            )}
            
            {estimate.markup_percentage && estimate.markup_percentage > 0 && (
              <div className="flex justify-between">
                <span>Markup ({estimate.markup_percentage}%):</span>
                <span>
                  {formatCurrency(
                    ((estimate.labor_cost || 0) + 
                     (estimate.material_cost || 0) + 
                     (estimate.equipment_cost || 0)) * 
                    (estimate.markup_percentage / 100)
                  )}
                </span>
              </div>
            )}
            
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(estimate.amount)}</span>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        {estimate.terms_and_conditions && (
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Terms and Conditions</h3>
            <p className="text-slate-700 whitespace-pre-wrap text-sm">
              {estimate.terms_and_conditions}
            </p>
          </div>
        )}

        {/* Important Dates */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-slate-700">Created:</span>
            <br />
            <span className="text-slate-600">{formatDate(estimate.created_at)}</span>
          </div>
          {estimate.valid_until && (
            <div>
              <span className="font-medium text-slate-700">Valid Until:</span>
              <br />
              <span className="text-slate-600">{formatDate(estimate.valid_until)}</span>
            </div>
          )}
          {estimate.sent_date && (
            <div>
              <span className="font-medium text-slate-700">Sent:</span>
              <br />
              <span className="text-slate-600">{formatDate(estimate.sent_date)}</span>
            </div>
          )}
          {estimate.responded_date && (
            <div>
              <span className="font-medium text-slate-700">Responded:</span>
              <br />
              <span className="text-slate-600">{formatDate(estimate.responded_date)}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {estimate.notes && (
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Notes</h3>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">
              {estimate.notes}
            </p>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
};