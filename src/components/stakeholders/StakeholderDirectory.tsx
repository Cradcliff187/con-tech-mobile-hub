
import { useState, useMemo } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { StakeholderCard } from './StakeholderCard';
import { StakeholderListView } from './StakeholderListView';
import { StakeholderFilters } from './StakeholderFilters';
import { ViewToggle } from './ViewToggle';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { DeleteStakeholderDialog } from './DeleteStakeholderDialog';
import { CreateStakeholderDialog } from './CreateStakeholderDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc, Plus } from 'lucide-react';
import type { Stakeholder } from '@/hooks/useStakeholders';

export const StakeholderDirectory = () => {
  const { stakeholders, loading, updateStakeholder, deleteStakeholder, createStakeholder, refetch } = useStakeholders();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'type' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [view, setView] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('stakeholder-view') as 'grid' | 'list') || 'grid';
  });

  // Dialog states
  const [editStakeholder, setEditStakeholder] = useState<Stakeholder | null>(null);
  const [deleteStakeholder, setDeleteStakeholder] = useState<Stakeholder | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
    localStorage.setItem('stakeholder-view', newView);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditStakeholder(stakeholder);
  };

  const handleDelete = (stakeholder: Stakeholder) => {
    setDeleteStakeholder(stakeholder);
  };

  const handleCreate = () => {
    setShowCreateDialog(true);
  };

  const handleStakeholderUpdated = () => {
    refetch();
    setEditStakeholder(null);
  };

  const handleStakeholderDeleted = () => {
    refetch();
    setDeleteStakeholder(null);
  };

  const handleStakeholderCreated = () => {
    refetch();
    setShowCreateDialog(false);
  };

  const filteredAndSortedStakeholders = useMemo(() => {
    let filtered = stakeholders.filter(stakeholder => {
      const matchesSearch = 
        stakeholder.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stakeholder.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stakeholder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stakeholder.phone?.includes(searchTerm) ||
        stakeholder.specialties?.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesType = typeFilter === 'all' || stakeholder.stakeholder_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || stakeholder.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
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
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [stakeholders, searchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

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
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Stakeholder Directory</h2>
        <Button onClick={handleCreate} className="gap-2">
          <Plus size={16} />
          Add Stakeholder
        </Button>
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
          />
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <ViewToggle view={view} onViewChange={handleViewChange} />
            
            {/* Sort Controls */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAndSortedStakeholders.length} of {stakeholders.length} stakeholders
      </div>

      {/* Stakeholder Display */}
      {view === 'list' ? (
        <StakeholderListView 
          stakeholders={filteredAndSortedStakeholders} 
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
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
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'No stakeholders match your search criteria' 
              : 'No stakeholders found'
            }
          </div>
          <div className="text-sm text-slate-400">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
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
        onStakeholderUpdated={handleStakeholderUpdated}
      />

      <DeleteStakeholderDialog
        open={!!deleteStakeholder}
        onOpenChange={(open) => !open && setDeleteStakeholder(null)}
        stakeholder={deleteStakeholder}
        onDeleted={handleStakeholderDeleted}
      />

      <CreateStakeholderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onStakeholderCreated={handleStakeholderCreated}
      />
    </div>
  );
};
