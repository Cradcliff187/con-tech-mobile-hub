import { useState, useMemo, memo, useCallback } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useDebounce } from '@/hooks/useDebounce';
import { OptimizedStakeholderCard } from './OptimizedStakeholderCard';
import { StakeholderFilters } from './StakeholderFilters';
import { EditStakeholderDialog } from './EditStakeholderDialog';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Stakeholder } from '@/hooks/useStakeholders';

const MemoizedFilters = memo(StakeholderFilters);

export const OptimizedStakeholderDirectory = () => {
  const { stakeholders, loading, deleteStakeholder } = useStakeholders();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'type' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Edit dialog state
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Delete confirmation state
  const [stakeholderToDelete, setStakeholderToDelete] = useState<Stakeholder | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Debounce search term to reduce unnecessary filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredAndSortedStakeholders = useMemo(() => {
    let filtered = stakeholders.filter(stakeholder => {
      const matchesSearch = 
        stakeholder.company_name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stakeholder.contact_person?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stakeholder.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stakeholder.phone?.includes(debouncedSearchTerm) ||
        stakeholder.specialties?.some(specialty => 
          specialty.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
          aValue = a.rating || 0;
          bValue = b.rating || 0;
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
  }, [stakeholders, debouncedSearchTerm, typeFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = useCallback((newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const handleEdit = useCallback((stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowEditDialog(true);
  }, []);

  const handleDelete = useCallback((stakeholder: Stakeholder) => {
    setStakeholderToDelete(stakeholder);
    setShowDeleteConfirmation(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!stakeholderToDelete) return;

    try {
      // Check if stakeholder has assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('stakeholder_assignments')
        .select('id')
        .eq('stakeholder_id', stakeholderToDelete.id);

      if (assignmentError) {
        throw new Error('Failed to check stakeholder assignments');
      }

      if (assignments && assignments.length > 0) {
        toast({
          title: "Cannot Delete Stakeholder",
          description: "This stakeholder has active assignments. Please remove all assignments before deleting.",
          variant: "destructive"
        });
        return;
      }

      // Check if stakeholder is assigned to tasks
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('assigned_stakeholder_id', stakeholderToDelete.id);

      if (taskError) {
        throw new Error('Failed to check stakeholder task assignments');
      }

      if (tasks && tasks.length > 0) {
        toast({
          title: "Cannot Delete Stakeholder",
          description: "This stakeholder is assigned to tasks. Please reassign tasks before deleting.",
          variant: "destructive"
        });
        return;
      }

      // Proceed with deletion
      await deleteStakeholder(stakeholderToDelete.id);
    } catch (error: any) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete stakeholder",
        variant: "destructive"
      });
    }
  }, [stakeholderToDelete, deleteStakeholder, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <MemoizedFilters
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          
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

      {/* Results Summary */}
      <div className="text-sm text-slate-600">
        Showing {filteredAndSortedStakeholders.length} of {stakeholders.length} stakeholders
      </div>

      {/* Stakeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStakeholders.map((stakeholder) => (
          <OptimizedStakeholderCard 
            key={stakeholder.id} 
            stakeholder={stakeholder}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedStakeholders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-500 mb-2">
            {debouncedSearchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
              ? 'No stakeholders match your search criteria' 
              : 'No stakeholders found'
            }
          </div>
          <div className="text-sm text-slate-400">
            {debouncedSearchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Add your first stakeholder to get started'
            }
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <EditStakeholderDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        stakeholder={selectedStakeholder}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Delete Stakeholder"
        description={`Are you sure you want to delete ${stakeholderToDelete?.company_name || 'this stakeholder'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};
