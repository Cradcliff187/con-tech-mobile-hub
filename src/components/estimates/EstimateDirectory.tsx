import { useState, useMemo, useCallback } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { useStakeholders } from '@/hooks/useStakeholders';
import { EstimateCard } from './EstimateCard';
import { EstimateList } from './EstimateList';
import { EstimateFilters } from './EstimateFilters';
import { ViewToggle } from '@/components/stakeholders/ViewToggle';
import { EditEstimateDialog } from './EditEstimateDialog';
import { DeleteEstimateDialog } from './DeleteEstimateDialog';
import { EstimatePreviewDialog } from './EstimatePreviewDialog';
import { CreateBidFromEstimateDialog } from './CreateBidFromEstimateDialog';
import { CreateEstimateDialog } from './CreateEstimateDialog';
import { ConvertEstimateToProjectDialog } from './ConvertEstimateToProjectDialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc, FileText, Plus } from 'lucide-react';
import type { Estimate } from '@/hooks/useEstimates';

interface EstimateDirectoryProps {
  onRefetch?: () => void;
}

export const EstimateDirectory = ({ onRefetch }: EstimateDirectoryProps) => {
  const { estimates, loading, updateEstimateStatus, refetch } = useEstimates();
  const { stakeholders } = useStakeholders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stakeholderFilter, setStakeholderFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'amount' | 'status' | 'created'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('estimate-view') as 'grid' | 'list') || 'grid';
  });

  // Dialog states
  const [editEstimate, setEditEstimate] = useState<Estimate | null>(null);
  const [estimateToDelete, setEstimateToDelete] = useState<Estimate | null>(null);
  const [previewEstimate, setPreviewEstimate] = useState<Estimate | null>(null);
  const [convertEstimate, setConvertEstimate] = useState<Estimate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleEdit = useCallback((estimate: Estimate) => {
    setEditEstimate(estimate);
  }, []);

  const handleDelete = useCallback((estimate: Estimate) => {
    setEstimateToDelete(estimate);
  }, []);

  const handlePreview = useCallback((estimate: Estimate) => {
    setPreviewEstimate(estimate);
  }, []);

  const handleConvertToProject = useCallback((estimate: Estimate) => {
    setConvertEstimate(estimate);
  }, []);

  const handleStatusChange = useCallback(async (estimateId: string, newStatus: Estimate['status']) => {
    await updateEstimateStatus(estimateId, newStatus);
  }, [updateEstimateStatus]);

  const handleEstimateUpdated = useCallback(() => {
    onRefetch?.();
    setEditEstimate(null);
  }, [onRefetch]);

  const handleEstimateDeleted = useCallback(() => {
    onRefetch?.();
    setEstimateToDelete(null);
  }, [onRefetch]);

  const handleEstimateConverted = useCallback(() => {
    onRefetch?.();
    setConvertEstimate(null);
  }, [onRefetch]);

  const handleViewChange = useCallback((newView: 'grid' | 'list') => {
    setView(newView);
    localStorage.setItem('estimate-view', newView);
  }, []);


  // Stabilize filter and sort dependencies
  const filterConfig = useMemo(() => ({
    searchTerm: searchTerm.toLowerCase(),
    statusFilter,
    stakeholderFilter,
    sortBy,
    sortOrder
  }), [searchTerm, statusFilter, stakeholderFilter, sortBy, sortOrder]);

  const filteredAndSortedEstimates = useMemo(() => {
    let filtered = estimates.filter(estimate => {
      const matchesSearch = 
        estimate.title?.toLowerCase().includes(filterConfig.searchTerm) ||
        estimate.estimate_number?.toLowerCase().includes(filterConfig.searchTerm) ||
        estimate.stakeholder?.contact_person?.toLowerCase().includes(filterConfig.searchTerm) ||
        estimate.stakeholder?.company_name?.toLowerCase().includes(filterConfig.searchTerm) ||
        estimate.description?.toLowerCase().includes(filterConfig.searchTerm);
      
      const matchesStatus = filterConfig.statusFilter === 'all' || estimate.status === filterConfig.statusFilter;
      const matchesStakeholder = filterConfig.stakeholderFilter === 'all' || estimate.stakeholder_id === filterConfig.stakeholderFilter;
      
      return matchesSearch && matchesStatus && matchesStakeholder;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filterConfig.sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return filterConfig.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filterConfig.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [estimates, filterConfig]);

  const toggleSort = useCallback((newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Estimate Directory</h2>
        <ViewToggle view={view} onViewChange={handleViewChange} />
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search estimates by title, number, or stakeholder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <EstimateFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            stakeholderFilter={stakeholderFilter}
            onStakeholderFilterChange={setStakeholderFilter}
            stakeholders={stakeholders}
          />
          
          {view === 'grid' && (
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'title' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('title')}
                className="min-h-[36px]"
              >
                Title {sortBy === 'title' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
              <Button
                variant={sortBy === 'amount' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('amount')}
                className="min-h-[36px]"
              >
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
              <Button
                variant={sortBy === 'status' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('status')}
                className="min-h-[36px]"
              >
                Status {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAndSortedEstimates.length} of {estimates.length} estimates
      </div>

      {/* Content */}
      {estimates.length === 0 ? (
        <EmptyState
          variant="card"
          icon={<FileText size={48} />}
          title="No Estimates Found"
          description="Start by creating your first estimate to track project costs and proposals for your clients."
              actions={[
                {
                  label: "Create Estimate",
                  onClick: () => setShowCreateDialog(true),
                  icon: <Plus size={16} />
                }
              ]}
        />
      ) : filteredAndSortedEstimates.length === 0 ? (
        <EmptyState
          icon={<Search size={48} />}
          title="No Results Found"
          description={
            searchTerm || statusFilter !== 'all' || stakeholderFilter !== 'all'
              ? 'No estimates match your current search criteria. Try adjusting your filters or search terms.'
              : 'No estimates found'
          }
          actions={
            searchTerm || statusFilter !== 'all' || stakeholderFilter !== 'all'
              ? [
                  {
                    label: "Clear Filters",
                    onClick: () => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setStakeholderFilter('all');
                    },
                    variant: "outline" as const
                  }
                ]
              : []
          }
        />
      ) : view === 'list' ? (
        <EstimateList
          estimates={filteredAndSortedEstimates}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={handlePreview}
          onStatusChange={handleStatusChange}
          onConvertToProject={handleConvertToProject}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedEstimates.map((estimate) => (
            <EstimateCard 
              key={estimate.id} 
              estimate={estimate}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={handlePreview}
              onStatusChange={handleStatusChange}
              onConvertToProject={handleConvertToProject}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <EditEstimateDialog
        open={!!editEstimate}
        onOpenChange={(open) => !open && setEditEstimate(null)}
        estimate={editEstimate}
      />

      <DeleteEstimateDialog
        open={!!estimateToDelete}
        onOpenChange={(open) => !open && setEstimateToDelete(null)}
        estimate={estimateToDelete}
        onDeleted={handleEstimateDeleted}
      />

      <EstimatePreviewDialog
        open={!!previewEstimate}
        onOpenChange={(open) => !open && setPreviewEstimate(null)}
        estimate={previewEstimate}
      />

      <CreateEstimateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetch();
        }}
      />

      <ConvertEstimateToProjectDialog
        open={!!convertEstimate}
        onOpenChange={(open) => !open && setConvertEstimate(null)}
        estimate={convertEstimate}
        onSuccess={handleEstimateConverted}
      />
    </div>
  );
};