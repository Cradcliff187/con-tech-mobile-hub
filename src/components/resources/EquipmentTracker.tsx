import { AlertTriangle, CheckCircle, Clock, Wrench, Plus, Edit, Trash } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEquipment, Equipment } from '@/hooks/useEquipment';
import { useToast } from '@/hooks/use-toast';
import { CreateEquipmentDialog } from './CreateEquipmentDialog';
import { EditEquipmentDialog } from './EditEquipmentDialog';
import { supabase } from '@/integrations/supabase/client';

export const EquipmentTracker = () => {
  const { equipment, loading, refetch } = useEquipment();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-use':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-orange-500" />;
      case 'available':
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <AlertTriangle size={16} className="text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-use':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'available':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleEdit = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setShowEditDialog(true);
  };

  const handleDelete = async (equipmentId: string, equipmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${equipmentName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(equipmentId);
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', equipmentId);

    if (error) {
      toast({
        title: "Error deleting equipment",
        description: error.message || "Failed to delete equipment",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `${equipmentName} has been deleted`
      });
      refetch();
    }
    setDeletingId(null);
  };

  const handleStatusUpdate = async (equipmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from('equipment')
      .update({ status: newStatus })
      .eq('id', equipmentId);

    if (error) {
      toast({
        title: "Error updating status",
        description: error.message || "Failed to update equipment status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Status updated",
        description: "Equipment status has been updated successfully"
      });
      refetch();
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Equipment Status</h3>
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus size={16} className="mr-2" />
            Add Equipment
          </Button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {equipment.length === 0 ? (
            <div className="p-6 text-center">
              <Wrench size={48} className="mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Equipment Found</h3>
              <p className="text-slate-500 mb-4">Add equipment to track utilization and maintenance</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Add First Equipment
              </Button>
            </div>
          ) : (
            equipment.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-slate-800 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Type: {item.type || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      Location: {item.project?.name || 'Available'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Operator: {item.operator?.full_name || 'Unassigned'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(item.status)}`}
                    >
                      <option value="available">Available</option>
                      <option value="in-use">In Use</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="out-of-service">Out of Service</option>
                    </select>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(item)}
                        title="Edit equipment"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={deletingId === item.id}
                        title="Delete equipment"
                      >
                        {deletingId === item.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                        ) : (
                          <Trash size={14} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Utilization</span>
                      <span className="font-medium text-slate-800">{item.utilization_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.min(item.utilization_rate || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Next Maintenance</p>
                    <p className="text-sm font-medium text-slate-800">
                      {item.maintenance_due 
                        ? new Date(item.maintenance_due).toLocaleDateString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
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
    </div>
  );
};
