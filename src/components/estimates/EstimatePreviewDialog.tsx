import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, TrendingUp, DollarSign, Info } from 'lucide-react';
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

        {/* Cost Breakdown & Profitability Analysis */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-slate-900">Cost Breakdown & Profitability Analysis</h3>
          </div>
          
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
                  <span>Subtotal (Costs):</span>
                  <span>
                    {formatCurrency(
                      (estimate.labor_cost || 0) + 
                      (estimate.material_cost || 0) + 
                      (estimate.equipment_cost || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Profit Amount:</span>
                  <span>
                    {formatCurrency(
                      estimate.amount - (
                        (estimate.labor_cost || 0) + 
                        (estimate.material_cost || 0) + 
                        (estimate.equipment_cost || 0)
                      )
                    )}
                  </span>
                </div>
              </>
            )}
            
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(estimate.amount)}</span>
            </div>
          </div>

          {/* Profitability Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Markup Percentage
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-900">
                  {(() => {
                    const subtotal = (estimate.labor_cost || 0) + (estimate.material_cost || 0) + (estimate.equipment_cost || 0);
                    const markup = subtotal > 0 ? ((estimate.amount - subtotal) / subtotal * 100) : 0;
                    return `${markup.toFixed(1)}%`;
                  })()}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Profit added to costs
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Gross Margin
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-900">
                  {(() => {
                    const subtotal = (estimate.labor_cost || 0) + (estimate.material_cost || 0) + (estimate.equipment_cost || 0);
                    const margin = estimate.amount > 0 ? ((estimate.amount - subtotal) / estimate.amount * 100) : 0;
                    return `${margin.toFixed(1)}%`;
                  })()}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Profit as % of total price
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profitability Summary */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {(() => {
                const subtotal = (estimate.labor_cost || 0) + (estimate.material_cost || 0) + (estimate.equipment_cost || 0);
                const profit = estimate.amount - subtotal;
                const margin = estimate.amount > 0 ? ((profit / estimate.amount) * 100) : 0;
                
                if (margin >= 20) {
                  return `Excellent profitability with ${formatCurrency(profit)} profit margin. This estimate provides strong financial returns.`;
                } else if (margin >= 10) {
                  return `Good profitability with ${formatCurrency(profit)} profit margin. This estimate meets standard industry margins.`;
                } else if (margin > 0) {
                  return `Low profitability with ${formatCurrency(profit)} profit margin. Consider reviewing costs or pricing strategy.`;
                } else {
                  return `No profit margin detected. This estimate may not cover all costs and overhead.`;
                }
              })()}
            </AlertDescription>
          </Alert>
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