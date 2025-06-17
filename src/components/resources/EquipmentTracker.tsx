
import { useState, useMemo } from 'react';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { CreateEquipmentDialog } from './CreateEquipmentDialog';
import { EditEquipmentDialog } from './EditEquipmentDialog';
import { ImportEquipmentDialog } from './ImportEquipmentDialog';
import { BulkEquipmentActions } from './BulkEquipmentActions';
import { EquipmentHeader } from './equipment/EquipmentHeader';
import { EquipmentStatusCard } from './equipment/EquipmentStatusCard';
import { EquipmentEmptyState } from './equipment/EquipmentEmptyState';
import { EquipmentFilters } from './equipment/EquipmentFilters';
import { QuickAllocationDialog } from './equipment/QuickAllocationDialog';
import { useEquipmentActions } from './equipment/useEquipmentActions';

export const EquipmentTracker = () => {
  const { equipment, loading, refetch } = useEquipment();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showBulkActionsDialog, setShowBulkActionsDialog] = useState(false);
  const [showQuickAllocationDialog, setShowQuickAllocationDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [selectedForQuickAllocation, setSelectedForQuickAllocation] = useState<Equipment | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const { deletingId, handleDelete, handleStatusUpdate } = useEquipmentActions(refetch);

  // Get available types for filter
  const availableTypes = useMemo(() => {
    const types = [...new Set(equipment.map(eq => eq.type).filter(Boolean))];
    return types.sort();
  }, [equipment]);

  // Filter equipment based on search and filters
  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchesSearch = !searchTerm || 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.assigned_operator?.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.operator?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;
      const matchesType = typeFilter === 'all' || eq.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [equipment, searchTerm, statusFilter, typeFilter]);

  const handleEdit = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setShowEditDialog(true);
  };

  const handleAddEquipment = () => {
    setShowCreateDialog(true);
  };

  const handleImportEquipment = () => {
    setShowImportDialog(true);
  };

  const handleBulkActions = () => {
    setShowBulkActionsDialog(true);
  };

  const handleQuickAllocation = () => {
    // Find the first available equipment for quick allocation
    const availableEquipment = filteredEquipment.find(eq => eq.status === 'available');
    if (availableEquipment) {
      setSelectedForQuickAllocation(availableEquipment);
      setShowQuickAllocationDialog(true);
    }
  };

  const handleDeleteEquipment = (id: string) => {
    const equipmentItem = equipment.find(eq => eq.id === id);
    const equipmentName = equipmentItem?.name || 'Unknown Equipment';
    handleDelete(id, equipmentName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          handleAddEquipment();
          break;
        case 'f':
          e.preventDefault();
          // Focus search input
          const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
          searchInput?.focus();
          break;
        case 'q':
          e.preventDefault();
          handleQuickAllocation();
          break;
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-500 mt-2">Loading equipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown} tabIndex={-1}>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <EquipmentHeader 
          onAddEquipment={handleAddEquipment}
          onImportEquipment={handleImportEquipment}
          onBulkActions={handleBulkActions}
          onQuickAllocation={handleQuickAllocation}
          selectedCount={selectedItems.length}
        />
        
        {equipment.length > 0 && (
          <div className="p-6 border-b border-slate-200">
            <EquipmentFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              availableTypes={availableTypes}
              equipmentCount={filteredEquipment.length}
            />
          </div>
        )}
        
        <div className="divide-y divide-slate-100">
          {equipment.length === 0 ? (
            <EquipmentEmptyState onAddEquipment={handleAddEquipment} />
          ) : filteredEquipment.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">No equipment matches your current filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                className="text-orange-600 hover:text-orange-700 mt-2 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredEquipment.map((item) => (
              <EquipmentStatusCard
                key={item.id}
                equipment={item}
                onEdit={handleEdit}
                onDelete={handleDeleteEquipment}
                onStatusUpdate={handleStatusUpdate}
                deletingId={deletingId}
              />
            ))
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        {filteredEquipment.length > 0 && (
          <div className="p-4 border-t bg-slate-50 text-xs text-slate-500">
            <div className="flex flex-wrap gap-4 justify-center">
              <span><kbd className="px-1 bg-white border rounded">Ctrl+N</kbd> Add Equipment</span>
              <span><kbd className="px-1 bg-white border rounded">Ctrl+F</kbd> Search</span>
              <span><kbd className="px-1 bg-white border rounded">Ctrl+Q</kbd> Quick Allocate</span>
            </div>
          </div>
        )}
      </div>

      <CreateEquipmentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={refetch}
      />

      <EditEquipmentDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        equipment={selectedEquipment}
        onSuccess={refetch}
      />

      <ImportEquipmentDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSuccess={refetch}
      />

      <BulkEquipmentActions
        open={showBulkActionsDialog}
        onOpenChange={setShowBulkActionsDialog}
        equipment={equipment}
        onSuccess={refetch}
      />

      <QuickAllocationDialog
        open={showQuickAllocationDialog}
        onOpenChange={setShowQuickAllocationDialog}
        equipment={selectedForQuickAllocation}
        onSuccess={refetch}
      />
    </div>
  );
};
