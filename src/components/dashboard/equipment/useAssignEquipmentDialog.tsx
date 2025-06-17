
import { useState, useEffect } from 'react';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Project } from '@/types/database';

export const useAssignEquipmentDialog = (
  project: Project,
  onSuccess: () => void,
  onClose: () => void
) => {
  const { createAllocation, checkAvailability } = useEquipmentAllocations();
  const { toast } = useToast();
  
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [operatorAssignments, setOperatorAssignments] = useState<Record<string, string>>({});
  const [availabilityCheck, setAvailabilityCheck] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedEquipment([]);
    setStartDate('');
    setEndDate('');
    setOperatorAssignments({});
    setAvailabilityCheck({});
  };

  useEffect(() => {
    const checkEquipmentAvailability = async () => {
      if (!startDate || !endDate || selectedEquipment.length === 0) {
        setAvailabilityCheck({});
        return;
      }

      const checks: Record<string, boolean> = {};
      
      for (const equipmentId of selectedEquipment) {
        const { isAvailable } = await checkAvailability(equipmentId, startDate, endDate);
        checks[equipmentId] = isAvailable || false;
      }
      
      setAvailabilityCheck(checks);
    };

    checkEquipmentAvailability();
  }, [selectedEquipment, startDate, endDate, checkAvailability]);

  const handleEquipmentToggle = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment(prev => [...prev, equipmentId]);
    } else {
      setSelectedEquipment(prev => prev.filter(id => id !== equipmentId));
      setOperatorAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[equipmentId];
        return newAssignments;
      });
    }
  };

  const handleOperatorAssignment = (equipmentId: string, operatorId: string) => {
    setOperatorAssignments(prev => ({
      ...prev,
      [equipmentId]: operatorId
    }));
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one equipment item",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    const hasUnavailableEquipment = selectedEquipment.some(id => availabilityCheck[id] === false);
    if (hasUnavailableEquipment) {
      toast({
        title: "Error",
        description: "Some selected equipment is not available for the selected dates",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const allocationPromises = selectedEquipment.map(async (equipmentId) => {
        const allocationResult = await createAllocation({
          equipment_id: equipmentId,
          project_id: project.id,
          start_date: startDate,
          end_date: endDate
        });

        if (allocationResult.error) {
          const errorMessage = typeof allocationResult.error === 'string' 
            ? allocationResult.error 
            : allocationResult.error.message || 'Failed to allocate equipment';
          throw new Error(errorMessage);
        }

        const operatorId = operatorAssignments[equipmentId];
        const { error: equipmentError } = await supabase
          .from('equipment')
          .update({
            status: 'in-use',
            assigned_operator_id: operatorId || null
          })
          .eq('id', equipmentId);

        if (equipmentError) {
          throw new Error(equipmentError.message || 'Failed to update equipment');
        }

        return allocationResult;
      });

      await Promise.all(allocationPromises);

      toast({
        title: "Success",
        description: `Successfully allocated ${selectedEquipment.length} equipment item(s) to ${project.name}`
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error allocating equipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to allocate equipment to project",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedEquipment,
    startDate,
    endDate,
    operatorAssignments,
    availabilityCheck,
    isSubmitting,
    resetForm,
    handleEquipmentToggle,
    handleOperatorAssignment,
    handleSubmit,
    setStartDate,
    setEndDate
  };
};
