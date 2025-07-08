import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit2, Trash2, MoreVertical, Send, CheckCircle, XCircle } from 'lucide-react';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import type { Estimate } from '@/hooks/useEstimates';

interface EstimateCardProps {
  estimate: Estimate;
  onEdit: (estimate: Estimate) => void;
  onDelete: (estimate: Estimate) => void;
  onPreview: (estimate: Estimate) => void;
  onStatusChange: (estimateId: string, status: Estimate['status']) => void;
}

export const EstimateCard = ({
  estimate,
  onEdit,
  onDelete,
  onPreview,
  onStatusChange
}: EstimateCardProps) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = estimate.valid_until && 
    new Date(estimate.valid_until) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">
                {estimate.title}
              </h3>
              {isExpiringSoon && estimate.status !== 'accepted' && estimate.status !== 'declined' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  Expires Soon
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 font-mono">
              {estimate.estimate_number}
            </p>
            <p className="text-sm text-slate-600">
              {estimate.stakeholder?.company_name || estimate.stakeholder?.contact_person}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(estimate)}>
                <Eye size={16} className="mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(estimate)}>
                <Edit2 size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              {estimate.status === 'draft' && (
                <DropdownMenuItem onClick={() => onStatusChange(estimate.id, 'sent')}>
                  <Send size={16} className="mr-2" />
                  Send to Client
                </DropdownMenuItem>
              )}
              {estimate.status === 'sent' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(estimate.id, 'accepted')}>
                    <CheckCircle size={16} className="mr-2" />
                    Mark Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(estimate.id, 'declined')}>
                    <XCircle size={16} className="mr-2" />
                    Mark Declined
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(estimate)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Status:</span>
            <GlobalStatusDropdown
              entityType="estimate"
              currentStatus={estimate.status}
              onStatusChange={(newStatus) => onStatusChange(estimate.id, newStatus as Estimate['status'])}
              size="sm"
              showAsDropdown={false}
            />
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Amount:</span>
            <span className="font-semibold text-lg text-slate-900">
              {formatCurrency(estimate.amount)}
            </span>
          </div>

          {/* Dates */}
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Created:</span>
              <span>{formatDate(estimate.created_at)}</span>
            </div>
            {estimate.sent_date && (
              <div className="flex justify-between">
                <span>Sent:</span>
                <span>{formatDate(estimate.sent_date)}</span>
              </div>
            )}
            {estimate.valid_until && (
              <div className="flex justify-between">
                <span>Valid Until:</span>
                <span className={isExpiringSoon ? 'text-orange-600 font-medium' : ''}>
                  {formatDate(estimate.valid_until)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {estimate.description && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {estimate.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};