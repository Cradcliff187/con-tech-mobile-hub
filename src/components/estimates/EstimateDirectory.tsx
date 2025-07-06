import { useState, useMemo, useCallback } from 'react';
import { useEstimates } from '@/hooks/useEstimates';
import { useStakeholders } from '@/hooks/useStakeholders';
import { EstimateCard } from './EstimateCard';
import { EstimateFilters } from './EstimateFilters';
import { EditEstimateDialog } from './EditEstimateDialog';
import { DeleteEstimateDialog } from './DeleteEstimateDialog';
import { EstimatePreviewDialog } from './EstimatePreviewDialog';
import { CreateBidFromEstimateDialog } from './CreateBidFromEstimateDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc } from 'lucide-react';
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

  // Dialog states
  const [editEstimate, setEditEstimate] = useState<Estimate | null>(null);
  const [estimateToDelete, setEstimateToDelete] = useState<Estimate | null>(null);
  const [previewEstimate, setPreviewEstimate] = useState<Estimate | null>(null);

  const handleEdit = useCallback((estimate: Estimate) => {
    setEditEstimate(estimate);
  }, []);

  const handleDelete = useCallback((estimate: Estimate) => {
    setEstimateToDelete(estimate);
  }, []);

  const handlePreview = useCallback((estimate: Estimate) => {
    setPreviewEstimate(estimate);
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

  // Add sample data if empty
  const sampleEstimates = useMemo(() => {
    if (estimates.length > 0) return estimates;
    
    return [
      {
        id: 'sample-1',
        estimate_number: 'EST-00001',
        stakeholder_id: 'sample-stakeholder-1',
        title: 'Kitchen Renovation Project',
        description: 'Complete kitchen remodel including cabinets, countertops, and appliances',
        amount: 45000,
        labor_cost: 25000,
        material_cost: 18000,
        equipment_cost: 2000,
        markup_percentage: 15,
        status: 'sent' as const,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sent_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stakeholder: {
          contact_person: 'John Smith',
          company_name: 'Smith Family',
          email: 'john@example.com'
        }
      },
      {
        id: 'sample-2',
        estimate_number: 'EST-00002',
        stakeholder_id: 'sample-stakeholder-2',
        title: 'Bathroom Addition',
        description: 'Master bathroom addition with luxury fixtures',
        amount: 32000,
        labor_cost: 18000,
        material_cost: 12000,
        equipment_cost: 2000,
        markup_percentage: 12,
        status: 'draft' as const,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        stakeholder: {
          contact_person: 'Sarah Johnson',
          company_name: 'Johnson Residence',
          email: 'sarah@example.com'
        }
      },
      {
        id: 'sample-3',
        estimate_number: 'EST-00003',
        stakeholder_id: 'sample-stakeholder-3',
        title: 'Deck Construction',
        description: 'Cedar deck with railing and stairs',
        amount: 15500,
        labor_cost: 8000,
        material_cost: 6500,
        equipment_cost: 1000,
        markup_percentage: 10,
        status: 'accepted' as const,
        sent_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responded_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        stakeholder: {
          contact_person: 'Mike Wilson',
          company_name: 'Wilson Property LLC',
          email: 'mike@example.com'
        }
      }
    ];
  }, [estimates]);

  // Stabilize filter and sort dependencies
  const filterConfig = useMemo(() => ({
    searchTerm: searchTerm.toLowerCase(),
    statusFilter,
    stakeholderFilter,
    sortBy,
    sortOrder
  }), [searchTerm, statusFilter, stakeholderFilter, sortBy, sortOrder]);

  const filteredAndSortedEstimates = useMemo(() => {
    let filtered = sampleEstimates.filter(estimate => {
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
  }, [sampleEstimates, filterConfig]);

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
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Estimate Directory</h2>
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
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAndSortedEstimates.length} of {sampleEstimates.length} estimates
      </div>

      {/* Estimate Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedEstimates.map((estimate) => (
          <EstimateCard 
            key={estimate.id} 
            estimate={estimate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPreview={handlePreview}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedEstimates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">
            {searchTerm || statusFilter !== 'all' || stakeholderFilter !== 'all'
              ? 'No estimates match your search criteria' 
              : 'No estimates found'
            }
          </div>
          <div className="text-sm text-slate-400">
            {searchTerm || statusFilter !== 'all' || stakeholderFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first estimate to get started'
            }
          </div>
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
    </div>
  );
};