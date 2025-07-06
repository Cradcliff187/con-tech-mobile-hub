import { useState, useMemo } from 'react';
import { useBids } from '@/hooks/useBids';
import { useEstimates } from '@/hooks/useEstimates';
import { BidCard } from './BidCard';
import { BidFilters } from './BidFilters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ResponsiveTable } from '@/components/common/ResponsiveTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2, TrendingUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditBidDialog } from './EditBidDialog';
import { DeleteBidDialog } from './DeleteBidDialog';
import { BidPreviewDialog } from './BidPreviewDialog';
import { ConvertBidToProjectDialog } from './ConvertBidToProjectDialog';

export const BidsDirectory = () => {
  const { bids, loading } = useBids();
  const { estimates } = useEstimates();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [estimateFilter, setEstimateFilter] = useState('all');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  
  // Dialog states
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showConvertDialog, setShowConvertDialog] = useState(false);

  const filteredBids = useMemo(() => {
    return bids.filter(bid => {
      const matchesSearch = !searchTerm || 
        bid.bid_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.estimate?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.stakeholder?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.stakeholder?.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bid.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || bid.status === statusFilter;
      const matchesEstimate = estimateFilter === 'all' || bid.estimate_id === estimateFilter;
      
      return matchesSearch && matchesStatus && matchesEstimate;
    });
  }, [bids, searchTerm, statusFilter, estimateFilter]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'submitted': return 'secondary';
      case 'accepted': return 'default';
      case 'declined': return 'destructive';
      case 'withdrawn': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'submitted': return 'text-blue-600 bg-blue-50';
      case 'accepted': return 'text-green-600 bg-green-50';
      case 'declined': return 'text-red-600 bg-red-50';
      case 'withdrawn': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAction = (action: string, bid: any) => {
    setSelectedBid(bid);
    switch (action) {
      case 'view':
        setShowPreviewDialog(true);
        break;
      case 'edit':
        setShowEditDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
      case 'convert':
        setShowConvertDialog(true);
        break;
    }
  };

  const handleDialogClose = () => {
    setSelectedBid(null);
    setShowEditDialog(false);
    setShowDeleteDialog(false);
    setShowPreviewDialog(false);
    setShowConvertDialog(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bids.length === 0) {
    return (
        <div className="text-center py-12">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bids yet</h3>
          <p className="text-slate-600">Create your first bid to start tracking opportunities</p>
        </div>
    );
  }

  const tableColumns = [
    { key: 'bid_number', header: 'Bid Number', label: 'Bid Number' },
    { key: 'estimate', header: 'Estimate', label: 'Estimate' },
    { key: 'stakeholder', header: 'Client', label: 'Client' },
    { key: 'amount', header: 'Amount', label: 'Amount' },
    { key: 'status', header: 'Status', label: 'Status' },
    { key: 'submission_date', header: 'Submitted', label: 'Submitted' },
    { key: 'actions', header: 'Actions', label: 'Actions' }
  ];

  const tableData = filteredBids.map(bid => ({
    id: bid.id,
    bid_number: bid.bid_number,
    estimate: bid.estimate?.estimate_number || 'Direct Bid',
    stakeholder: bid.stakeholder?.company_name || bid.stakeholder?.contact_person || 'Unknown',
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(bid.bid_amount),
    status: (
      <Badge variant={getStatusBadgeVariant(bid.status)} className={getStatusColor(bid.status)}>
        {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
      </Badge>
    ),
    submission_date: bid.submission_date ? new Date(bid.submission_date).toLocaleDateString() : '-',
    actions: (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction('view', bid)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('edit', bid)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Bid
          </DropdownMenuItem>
          {bid.status === 'accepted' && !bid.project_id && (
            <DropdownMenuItem onClick={() => handleAction('convert', bid)}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Convert to Project
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => handleAction('delete', bid)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Bid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }));

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search bids by number, estimate, client, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <BidFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          estimateFilter={estimateFilter}
          onEstimateFilterChange={setEstimateFilter}
          estimates={estimates}
        />
      </div>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          {filteredBids.length} bid{filteredBids.length !== 1 ? 's' : ''} found
        </p>
        
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setView('cards')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              view === 'cards'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Results */}
      {filteredBids.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No bids match your current filters
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBids.map((bid) => (
            <BidCard
              key={bid.id}
              bid={bid}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <ResponsiveTable
          columns={tableColumns}
          data={tableData}
        />
      )}

      {/* Dialogs */}
      <EditBidDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        bid={selectedBid}
        onSuccess={handleDialogClose}
      />
      
      <DeleteBidDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        bid={selectedBid}
        onDeleted={handleDialogClose}
      />
      
      <BidPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        bid={selectedBid}
      />
      
      <ConvertBidToProjectDialog
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
        bid={selectedBid}
        onSuccess={handleDialogClose}
      />
    </div>
  );
};