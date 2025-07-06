import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Target,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Bid } from '@/hooks/useBids';

interface BidCardProps {
  bid: Bid;
  onAction: (action: string, bid: Bid) => void;
}

export const BidCard = ({ bid, onAction }: BidCardProps) => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900">{bid.bid_number}</h3>
            {bid.estimate && (
              <p className="text-sm text-slate-600">
                From: {bid.estimate.estimate_number}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(bid.status)}`}>
              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction('view', bid)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('edit', bid)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Bid
                </DropdownMenuItem>
                {bid.status === 'accepted' && !bid.project_id && (
                  <DropdownMenuItem onClick={() => onAction('convert', bid)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Convert to Project
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => onAction('delete', bid)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Bid
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Client Information */}
        {bid.stakeholder && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">
              {bid.stakeholder.company_name || bid.stakeholder.contact_person}
            </span>
          </div>
        )}

        {/* Bid Amount */}
        <div className="text-2xl font-bold text-slate-900">
          {formatCurrency(bid.bid_amount)}
        </div>

        {/* Competition Info */}
        {bid.competitor_count && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Target className="h-4 w-4 text-slate-400" />
            <span>{bid.competitor_count} competitors</span>
            {bid.win_probability && (
              <span className="ml-2 text-green-600 font-medium">
                {bid.win_probability}% win chance
              </span>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {bid.submission_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Submitted: {new Date(bid.submission_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Project Link */}
        {bid.project && (
          <div className="pt-2 mt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600 font-medium">
                Converted to: {bid.project.name}
              </span>
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {bid.notes && (
          <div className="text-sm text-slate-600 line-clamp-2">
            {bid.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
};