
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentFormFields } from './equipment/EquipmentFormFields';
import { AllocationSection } from './equipment/AllocationSection';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';

interface CreateEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateEquipmentDialog = ({
  open,
  onOpenChange,
  onSuccess
}: CreateEquipmentDialogProps) => {
  const { toast } = useToast();
  const { createAllocation, getConflictingAllocations } = useEquipmentAllocations();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'available',
    maintenance_due: ''
  });

  const [allocationData, setAllocationData] = useState({
    projectId: '',
    operatorType: 'employee' as 'employee' | 'user',
    operatorId: '',
    taskId: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocateToProject, setAllocateToProject] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      status: 'available',
      maintenance_due: ''
    });
    setAllocationData({
      projectId: '',
      operatorType: 'employee',
      operatorId: '',
      taskId: '',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setConflicts([]);
    setAllocateToProject(false);
  };

  const checkForConflicts = async (equipmentId: string) => {
    if (!allocationData.startDate || !allocationData.endDate) return;

    const { conflicts: foundConflicts } = await getConflictingAllocations(
      equipmentId,
      allocationData.startDate,
      allocationData.endDate
    );
    setConflicts(foundConflicts || []);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (allocateToProject) {
      if (!allocationData.projectId || !allocationData.operatorId || !allocationData.startDate || !allocationData.endDate) {
        toast({
          title: "Error",
          description: "Please fill in all allocation fields",
          variant: "destructive"
        });
        return;
      }

      if (conflicts.length > 0) {
        toast({
          title: "Error",
          description: "Cannot create allocation due to conflicts. Please resolve conflicts first.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .insert({
          name: formData.name,
          type: formData.type,
          status: allocateToProject ? 'in-use' : formData.status,
          maintenance_due: formData.maintenance_due || null
        })
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Create allocation if requested
      if (allocateToProject && equipment) {
        const allocationResult = await createAllocation({
          equipment_id: equipment.id,
          project_id: allocationData.projectId,
          task_id: allocationData.taskId || undefined,
          operator_type: allocationData.operatorType,
          operator_id: allocationData.operatorId,
          start_date: allocationData.startDate,
          end_date: allocationData.endDate,
          notes: allocationData.notes || undefined
        });

        if (allocationResult.error) {
          throw new Error(typeof allocationResult.error === 'string' ? allocationResult.error : allocationResult.error.message || 'Failed to create allocation');
        }
      }

      toast({
        title: "Success",
        description: `Equipment "${formData.name}" has been created${allocateToProject ? ' and allocated' : ''} successfully`
      });

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create equipment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <EquipmentFormFields
            name={formData.name}
            setName={(name) => setFormData(prev => ({ ...prev, name }))}
            type={formData.type}
            setType={(type) => setFormData(prev => ({ ...prev, type }))}
            status={formData.status}
            setStatus={(status) => setFormData(prev => ({ ...prev, status }))}
            maintenanceDue={formData.maintenance_due}
            setMaintenanceDue={(maintenance_due) => setFormData(prev => ({ ...prev, maintenance_due }))}
          />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allocate-to-project"
                checked={allocateToProject}
                onChange={(e) => setAllocateToProject(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="allocate-to-project" className="text-sm font-medium">
                Allocate to project immediately
              </label>
            </div>

            {allocateToProject && (
              <AllocationSection
                projectId={allocationData.projectId}
                operatorType={allocationData.operatorType}
                operatorId={allocationData.operatorId}
                taskId={allocationData.taskId}
                startDate={allocationData.startDate}
                endDate={allocationData.endDate}
                notes={allocationData.notes}
                onProjectChange={(projectId) => 
                  setAllocationData(prev => ({ ...prev, projectId }))
                }
                onOperatorTypeChange={(operatorType) => 
                  setAllocationData(prev => ({ ...prev, operatorType, operatorId: '' }))
                }
                onOperatorChange={(operatorId) => 
                  setAllocationData(prev => ({ ...prev, operatorId }))
                }
                onTaskChange={(taskId) => 
                  setAllocationData(prev => ({ ...prev, taskId: taskId || '' }))
                }
                onStartDateChange={(startDate) => 
                  setAllocationData(prev => ({ ...prev, startDate }))
                }
                onEndDateChange={(endDate) => 
                  setAllocationData(prev => ({ ...prev, endDate }))
                }
                onNotesChange={(notes) => 
                  setAllocationData(prev => ({ ...prev, notes }))
                }
                conflicts={conflicts}
                showConflicts={conflicts.length > 0}
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Equipment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
