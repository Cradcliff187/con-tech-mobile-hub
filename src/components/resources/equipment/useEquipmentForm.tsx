import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/hooks/useEquipment';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { normalizeSelectValue, prepareSelectDataForDB } from '@/utils/selectHelpers';

interface UseEquipmentFormProps {
  equipment: Equipment | null;
  open: boolean;
  onSuccess?: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useEquipmentForm = ({ equipment, open, onSuccess, onOpenChange }: UseEquipmentFormProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('available');
  const [projectId, setProjectId] = useState('none');
  const [operatorType, setOperatorType] = useState<'employee' | 'user'>('employee');
  const [assignedOperatorId, setAssignedOperatorId] = useState('none');
  const [operatorId, setOperatorId] = useState('none');
  const [maintenanceDue, setMaintenanceDue] = useState('');

  const { toast } = useToast();

  const updateOperation = useAsyncOperation({
    successMessage: "Equipment updated successfully",
    errorMessage: "Failed to update equipment",
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    }
  });

  // Pre-fill form with equipment data when dialog opens
  useEffect(() => {
    if (equipment && open) {
      setName(equipment.name);
      setType(equipment.type || '');
      setStatus(equipment.status);
      setProjectId(normalizeSelectValue(equipment.project_id));
      setAssignedOperatorId(normalizeSelectValue(equipment.assigned_operator_id));
      setOperatorId(normalizeSelectValue(equipment.operator_id));
      setMaintenanceDue(equipment.maintenance_due || '');
      
      // Set operator type based on which field has a value
      if (equipment.assigned_operator_id) {
        setOperatorType('employee');
      } else if (equipment.operator_id) {
        setOperatorType('user');
      } else {
        setOperatorType('employee');
      }
    }
  }, [equipment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !name.trim() || !type.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment name and type are required",
        variant: "destructive"
      });
      return;
    }

    await updateOperation.execute(async () => {
      const updateData = {
        name: name.trim(),
        type: type.trim(),
        status,
        project_id: projectId,
        maintenance_due: maintenanceDue,
        assigned_operator_id: operatorType === 'employee' ? assignedOperatorId : 'none',
        operator_id: operatorType === 'user' ? operatorId : 'none',
      };

      // Prepare data for database using standardized helper
      const dbData = prepareSelectDataForDB(updateData);

      const { error } = await supabase
        .from('equipment')
        .update(dbData)
        .eq('id', equipment.id);

      if (error) {
        throw new Error(error.message);
      }
    });
  };

  const resetForm = () => {
    setName('');
    setType('');
    setStatus('available');
    setProjectId('none');
    setOperatorType('employee');
    setAssignedOperatorId('none');
    setOperatorId('none');
    setMaintenanceDue('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return {
    // Form state
    name, setName,
    type, setType,
    status, setStatus,
    projectId, setProjectId,
    operatorType, setOperatorType,
    assignedOperatorId, setAssignedOperatorId,
    operatorId, setOperatorId,
    maintenanceDue, setMaintenanceDue,
    
    // Form handlers
    handleSubmit,
    handleOpenChange,
    
    // Operation state
    updateOperation
  };
};
