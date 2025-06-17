
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEquipmentActions = (refetch: () => void) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

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

  return {
    deletingId,
    handleDelete,
    handleStatusUpdate
  };
};
