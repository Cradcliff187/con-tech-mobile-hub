
import { useState, useMemo, useCallback } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { StakeholderCard } from './StakeholderCard';
import { StakeholderListView } from './StakeholderListView';
import { StakeholderFilters } from './StakeholderFilters';
import { ViewToggle } from './ViewToggle';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog';
import { AssignStakeholderDialog } from './AssignStakeholderDialog';
import { LeadPipelineView } from './LeadPipelineView';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc, Columns, Grid } from 'lucide-react';
import type { Stakeholder } from '@/hooks/useStakeholders';

interface StakeholderDirectoryProps {
  onRefetch?: () => void;
}

export const StakeholderDirectory = ({ onRefetch }: StakeholderDirectoryProps) => {
  const { stakeholders, loading, updateStakeholder, deleteStakeholder: deleteStakeholderFn, refetch } = useStakeholders();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'type' | 'created' | 'lead_score'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'grid' | 'list' | 'pipeline'>(() => {
    return (localStorage.getItem('stakeholder-view') as 'grid' | 'list' | 'pipeline') || 'grid';
  });

  // Dialog states
  const [editStakeholder, setEditStakeholder] = useState<Stakeholder | null>(null);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<Stakeholder | null>(null);
  const [stakeholderToAssign, setStakeholderToAssign] = useState<Stakeholder | null>(null);

  const handleViewChange = useCallback((newView: 'grid' | 'list' | 'pipeline') => {
    setView(newView);
    localStorage.setItem('stakeholder-view', newView);
  }, []);

  const handleEdit = useCallback((stakeholder: Stakeholder) => {
    setEditStakeholder(stakeholder);
  }, []);

  const handleDelete = useCallback((stakeholder: Stakeholder) => {
    setStakeholderToDelete(stakeholder);
  }, []);

  const handleAssign = useCallback((stakeholder: Stakeholder) => {
    setStakeholderToAssign(stakeholder);
  }, []);

  const handleStakeholderUpdated = useCallback(() => {
    onRefetch?.();
    setEditStakeholder(null);
  }, [onRefetch]);

  const handleStakeholderDeleted = useCallback(() => {
    onRefetch?.();
    setStakeholderToDelete(null);
  }, [onRefetch]);

  // Stabilize filter and sort dependencies
  const filterConfig = useMemo(() => ({
    searchTerm: searchTerm.toLowerCase(),
    typeFilter,
    statusFilter,
    leadStatusFilter,
    sortBy,
    sortOrder
  }), [searchTerm, typeFilter, statusFilter, leadStatusFilter, sortBy, sortOrder]);

  const filteredAndSortedStakeholders = useMemo(() => {
    let filtered = stakeholders.filter(stakeholder => {
      const matchesSearch = 
        stakeholder.company_name?.toLowerCase().includes(filterConfig.searchTerm) ||
        stakeholder.contact_person?.toLowerCase().includes(filterConfig.searchTerm) ||
        stakeholder.email?.toLowerCase().includes(filterConfig.searchTerm) ||
        stakeholder.phone?.includes(searchTerm) ||
        stakeholder.specialties?.some(specialty => 
          specialty.toLowerCase().includes(filterConfig.searchTerm)
        );
      
      const matchesType = filterConfig.typeFilter === 'all' || stakeholder.stakeholder_type === filterConfig.typeFilter;
      const matchesStatus = filterConfig.statusFilter === 'all' || stakeholder.status === filterConfig.statusFilter;
      const matchesLeadStatus = filterConfig.leadStatusFilter === 'all' || 
        (stakeholder.lead_status || 'new') === filterConfig.leadStatusFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesLeadStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (filterConfig.sortBy) {
        case 'name':
          aValue = a.company_name?.toLowerCase() || '';
          bValue = b.company_name?.toLowerCase() || '';
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'type':
          aValue = a.stakeholder_type;
          bValue = b.stakeholder_type;
          break;
        case 'lead_score':
          aValue = a.lead_score || 0;
          bValue = b.lead_score || 0;
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
  }, [stakeholders, filterConfig, searchTerm]);

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
        <h2 className="text-2xl font-bold text-slate-900">Stakeholder Directory</h2>
        
        {/* View Toggle - Enhanced */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('grid')}
            className="min-h-[36px]"
          >
            <Grid size={16} className="mr-2" />
            Grid
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('list')}
            className="min-h-[36px]"
          >
            <Search size={16} className="mr-2" />
            List
          </Button>
          <Button
            variant={view === 'pipeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange('pipeline')}
            className="min-h-[36px]"
          >
            <Columns size={16} className="mr-2" />
            Pipeline
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <Input
            placeholder="Search by name, email, phone, or specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <StakeholderFilters
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            leadStatusFilter={leadStatusFilter}
            onLeadStatusFilterChange={setLeadStatusFilter}
          />
          
          {view !== 'pipeline' && view !== 'list' && (
          <div className="flex items-center gap-4">
            {/* Sort Controls - Hidden in list view since DataTable handles column sorting */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('name')}
                className="min-h-[36px]"
              >
                Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('rating')}
                className="min-h-[36px]"
              >
                Rating {sortBy === 'rating' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
              <Button
                variant={sortBy === 'type' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('type')}
                className="min-h-[36px]"
              >
                Type {sortBy === 'type' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
              <Button
                variant={sortBy === 'lead_score' ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSort('lead_score')}
                className="min-h-[36px]"
              >
                Lead Score {sortBy === 'lead_score' && (sortOrder === 'asc' ? <SortAsc size={16} className="ml-1" /> : <SortDesc size={16} className="ml-1" />)}
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAndSortedStakeholders.length} of {stakeholders.length} stakeholders
      </div>

      {/* Stakeholder Display */}
      {view === 'pipeline' ? (
        <LeadPipelineView 
          stakeholders={filteredAndSortedStakeholders} 
          loading={loading}
        />
      ) : view === 'list' ? (
        <StakeholderListView 
          stakeholders={filteredAndSortedStakeholders} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssign={handleAssign}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedStakeholders.map((stakeholder) => (
            <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedStakeholders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || leadStatusFilter !== 'all'
              ? 'No stakeholders match your search criteria' 
              : 'No stakeholders found'
            }
          </div>
          <div className="text-sm text-slate-400">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || leadStatusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first stakeholder to get started'
            }
          </div>
        </div>
      )}

      {/* Dialogs */}
      <EditStakeholderDialog
        open={!!editStakeholder}
        onOpenChange={(open) => !open && setEditStakeholder(null)}
        stakeholder={editStakeholder}
      />

      <DeleteStakeholderDialog
        open={!!stakeholderToDelete}
        onOpenChange={(open) => !open && setStakeholderToDelete(null)}
        stakeholder={stakeholderToDelete}
        onDeleted={handleStakeholderDeleted}
      />

      <AssignStakeholderDialog
        open={!!stakeholderToAssign}
        onOpenChange={(open) => !open && setStakeholderToAssign(null)}
        stakeholder={stakeholderToAssign}
      />
    </div>
  );
};
