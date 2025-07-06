import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Target, 
  Users, 
  TrendingUp, 
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';
import type { Bid } from '@/hooks/useBids';

interface BidPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bid: Bid | null;
}

export const BidPreviewDialog = ({
  open,
  onOpenChange,
  bid
}: BidPreviewDialogProps) => {
  if (!bid) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'accepted': return 'text-green-600 bg-green-50 border-green-200';
      case 'declined': return 'text-red-600 bg-red-50 border-red-200';
      case 'withdrawn': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Bid Details - ${bid.bid_number}`}
      className="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{bid.bid_number}</h3>
            {bid.estimate && (
              <p className="text-slate-600 mt-1">
                From Estimate: {bid.estimate.estimate_number}
              </p>
            )}
          </div>
          <Badge className={`${getStatusColor(bid.status)}`}>
            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bid Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(bid.bid_amount)}</div>
            </CardContent>
          </Card>

          {bid.win_probability && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Probability</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{bid.win_probability}%</div>
              </CardContent>
            </Card>
          )}

          {bid.competitor_count && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Competitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bid.competitor_count}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Client Information */}
        {bid.stakeholder && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Company:</span> {bid.stakeholder.company_name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Contact:</span> {bid.stakeholder.contact_person}
              </div>
              {bid.stakeholder.email && (
                <div>
                  <span className="font-medium">Email:</span> {bid.stakeholder.email}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Important Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Created:</span>
              <span className="font-medium">{formatDate(bid.created_at)}</span>
            </div>
            
            {bid.submission_date && (
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-600">Submitted:</span>
                <span className="font-medium">{formatDate(bid.submission_date)}</span>
              </div>
            )}
            
            {bid.decision_date && (
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">Decision:</span>
                <span className="font-medium">{formatDate(bid.decision_date)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Competition Analysis */}
        {(bid.estimated_competition_range_low || bid.estimated_competition_range_high) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Competition Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bid.estimated_competition_range_low && bid.estimated_competition_range_high && (
                <div>
                  <span className="text-sm text-slate-600">Estimated Range:</span>
                  <div className="font-medium">
                    {formatCurrency(bid.estimated_competition_range_low)} - {formatCurrency(bid.estimated_competition_range_high)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Project Conversion */}
        {bid.project && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Project Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">
                  Successfully converted to project: {bid.project.name}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Project Status: {bid.project.status}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes and Reasons */}
        {(bid.win_loss_reason || bid.notes) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bid.win_loss_reason && (
                <div>
                  <span className="font-medium text-slate-700">Win/Loss Reason:</span>
                  <p className="text-slate-600 mt-1">{bid.win_loss_reason}</p>
                </div>
              )}
              
              {bid.notes && (
                <div>
                  <span className="font-medium text-slate-700">Notes:</span>
                  <p className="text-slate-600 mt-1">{bid.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ResponsiveDialog>
  );
};