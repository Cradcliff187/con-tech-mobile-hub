
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentFormFields } from './equipment/EquipmentFormFields';
import { AllocationSection } from './equipment/AllocationSection';
import { AllocationStatus } from './equipment/AllocationStatus';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import type { Equipment } from '@/hooks/useEquipment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess: () => void;
}

export const EditEquipmentDialog = ({
  open,
  onOpenChange,
  equipment,
  onSuccess
}: EditEquipmentDialogProps) => {
  const { toast } = useToast();
  const { allocations, createAllocation, getConflictingAllocations } = useEquipmentAllocations(equipment?.id);
  
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

  const currentAllocation = allocations.find(a => 
    new Date(a.start_date) <= new Date() && new Date() <= new Date(a.end_date)
  );

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name,
        type: equipment.type || '',
        status: equipment.status || 'available',
        maintenance_due: equipment.maintenance_due || ''
      });
    }
  }, [equipment]);

  const checkForConflicts = async () => {
    if (!equipment || !allocationData.startDate || !allocationData.endDate) return;

    const { conflicts: foundConflicts } = await getConflictingAllocations(
      equipment.id,
      allocationData.startDate,
      allocationData.endDate
    );
    setConflicts(foundConflicts || []);
  };

  useEffect(() => {
    checkForConflicts();
  }, [allocationData.startDate, allocationData.endDate]);

  const handleSubmit = async () => {
    if (!equipment || !formData.name || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          name: formData.name,
          type: formData.type,
          status: formData.status,
          maintenance_due: formData.maintenance_due || null
        })
        .eq('id', equipment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment updated successfully"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAllocation = async () => {
    if (!equipment || !allocationData.projectId || !allocationData.operatorId || 
        !allocationData.startDate || !allocationData.endDate) {
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

    try {
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
        throw new Error(allocationResult.error.message || 'Failed to create allocation');
      }

      // Update equipment status to in-use
      await supabase
        .from('equipment')
        .update({ status: 'in-use' })
        .eq('id', equipment.id);

      toast({
        title: "Success",
        description: "Equipment allocation created successfully"
      });

      // Reset allocation form
      setAllocationData({
        projectId: '',
        operatorType: 'employee',
        operatorId: '',
        taskId: '',
        startDate: '',
        endDate: '',
        notes: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating allocation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create allocation",
        variant: "destructive"
      });
    }
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment - {equipment.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Equipment Details</TabsTrigger>
            <TabsTrigger value="allocation">Current Allocation</TabsTrigger>
            <TabsTrigger value="new-allocation">New Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <EquipmentFormFields
              formData={formData}
              onChange={setFormData}
              showProjectAssignment={false}
            />

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
                {isSubmitting ? 'Updating...' : 'Update Equipment'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Current Allocation Status</h3>
              <AllocationStatus allocation={currentAllocation} />
            </div>

            {allocations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">All Allocations</h4>
                <div className="space-y-3">
                  {allocations.map((allocation) => (
                    <div key={allocation.id} className="border rounded-lg p-3">
                      <AllocationStatus allocation={allocation} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="new-allocation" className="space-y-6">
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

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAllocation}
                disabled={conflicts.length > 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Create Allocation
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
