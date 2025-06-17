
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EquipmentFormFields } from './equipment/EquipmentFormFields';
import { AllocationSection } from './equipment/AllocationSection';
import { AllocationSummary } from './equipment/AllocationSummary';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useUsers } from '@/hooks/useUsers';
import { useTasks } from '@/hooks/useTasks';
import { validateEquipmentForm, validateAllocationForm, type AllocationFormData, type EquipmentFormData } from '@/utils/formValidation';
import { prepareOptionalSelectField } from '@/utils/selectHelpers';

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
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { users } = useUsers();
  const { tasks } = useTasks();
  
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    type: '',
    status: 'available',
    maintenance_due: ''
  });

  const [allocationData, setAllocationData] = useState<AllocationFormData>({
    projectId: 'none',
    operatorType: 'employee',
    operatorId: 'none',
    taskId: 'none',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allocateToProject, setAllocateToProject] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      status: 'available',
      maintenance_due: ''
    });
    setAllocationData({
      projectId: 'none',
      operatorType: 'employee',
      operatorId: 'none',
      taskId: 'none',
      startDate: '',
      endDate: '',
      notes: ''
    });
    setConflicts([]);
    setAllocateToProject(false);
    setValidationErrors({});
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
    // Validate equipment form
    const equipmentValidation = validateEquipmentForm(formData);
    let allValidationErrors = equipmentValidation.errors;

    // Validate allocation form if needed
    if (allocateToProject) {
      const allocationValidation = validateAllocationForm(allocationData);
      allValidationErrors = { ...allValidationErrors, ...allocationValidation.errors };

      if (conflicts.length > 0) {
        allValidationErrors.conflicts = "Cannot create allocation due to conflicts. Please resolve conflicts first.";
      }
    }

    // Show validation errors
    if (Object.keys(allValidationErrors).length > 0) {
      setValidationErrors(allValidationErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});

    try {
      // Prepare equipment data for database with proper field handling
      const equipmentDbData = {
        name: formData.name.trim(),
        type: formData.type.trim(),
        status: allocateToProject ? 'in-use' : formData.status,
        maintenance_due: formData.maintenance_due || null
      };

      // Create equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .insert(equipmentDbData)
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Create allocation if requested
      if (allocateToProject && equipment) {
        const allocationCreateData = {
          equipment_id: equipment.id,
          project_id: allocationData.projectId,
          task_id: prepareOptionalSelectField(allocationData.taskId),
          operator_type: allocationData.operatorType,
          operator_id: prepareOptionalSelectField(allocationData.operatorId),
          start_date: allocationData.startDate,
          end_date: allocationData.endDate,
          notes: allocationData.notes || undefined
        };

        const allocationResult = await createAllocation(allocationCreateData);

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

  const handleOperatorTypeChange = (operatorType: 'employee' | 'user') => {
    setAllocationData(prev => ({ 
      ...prev, 
      operatorType, 
      operatorId: 'none' // Reset operator selection when type changes
    }));
    // Clear operator validation error when type changes
    if (validationErrors.operator) {
      setValidationErrors(prev => {
        const { operator, ...rest } = prev;
        return rest;
      });
    }
  };

  // Get display names for summary
  const getProjectName = () => {
    if (allocationData.projectId === 'none') return undefined;
    return projects.find(p => p.id === allocationData.projectId)?.name;
  };

  const getOperatorName = () => {
    if (allocationData.operatorId === 'none') return undefined;
    
    if (allocationData.operatorType === 'employee') {
      const stakeholder = stakeholders.find(s => s.id === allocationData.operatorId);
      return stakeholder?.contact_person || stakeholder?.company_name;
    } else {
      const user = users.find(u => u.id === allocationData.operatorId);
      return user?.full_name || user?.email;
    }
  };

  const getTaskTitle = () => {
    if (!allocationData.taskId || allocationData.taskId === 'none') return undefined;
    return tasks.find(t => t.id === allocationData.taskId)?.title;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <EquipmentFormFields
              name={formData.name}
              setName={(name) => {
                setFormData(prev => ({ ...prev, name }));
                // Clear name error when user starts typing
                if (validationErrors.name) {
                  setValidationErrors(prev => {
                    const { name: nameError, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              type={formData.type}
              setType={(type) => {
                setFormData(prev => ({ ...prev, type }));
                // Clear type error when user starts typing
                if (validationErrors.type) {
                  setValidationErrors(prev => {
                    const { type: typeError, ...rest } = prev;
                    return rest;
                  });
                }
              }}
              status={formData.status}
              setStatus={(status) => setFormData(prev => ({ ...prev, status }))}
              maintenanceDue={formData.maintenance_due}
              setMaintenanceDue={(maintenance_due) => setFormData(prev => ({ ...prev, maintenance_due }))}
              errors={validationErrors}
            />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allocate-to-project"
                  checked={allocateToProject}
                  onChange={(e) => {
                    setAllocateToProject(e.target.checked);
                    if (!e.target.checked) {
                      // Clear allocation validation errors when unchecking
                      setValidationErrors(prev => {
                        const { project, operator, dates, conflicts, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
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
                  onProjectChange={(projectId) => {
                    setAllocationData(prev => ({ ...prev, projectId }));
                    // Clear project error when selection changes
                    if (validationErrors.project) {
                      setValidationErrors(prev => {
                        const { project, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  onOperatorTypeChange={handleOperatorTypeChange}
                  onOperatorChange={(operatorId) => {
                    setAllocationData(prev => ({ ...prev, operatorId }));
                    // Clear operator error when selection changes
                    if (validationErrors.operator) {
                      setValidationErrors(prev => {
                        const { operator, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  onTaskChange={(taskId) => 
                    setAllocationData(prev => ({ ...prev, taskId: taskId || 'none' }))
                  }
                  onStartDateChange={(startDate) => {
                    setAllocationData(prev => ({ ...prev, startDate }));
                    // Clear date error when selection changes
                    if (validationErrors.dates) {
                      setValidationErrors(prev => {
                        const { dates, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  onEndDateChange={(endDate) => {
                    setAllocationData(prev => ({ ...prev, endDate }));
                    // Clear date error when selection changes
                    if (validationErrors.dates) {
                      setValidationErrors(prev => {
                        const { dates, ...rest } = prev;
                        return rest;
                      });
                    }
                  }}
                  onNotesChange={(notes) => 
                    setAllocationData(prev => ({ ...prev, notes }))
                  }
                  conflicts={conflicts}
                  showConflicts={conflicts.length > 0}
                  errors={validationErrors}
                />
              )}

              {/* Display validation errors */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 font-medium mb-2">Please fix the following errors:</div>
                  <div className="space-y-1 text-sm text-red-700">
                    {Object.entries(validationErrors).map(([field, error]) => (
                      <div key={field}>• {error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Sidebar */}
          {allocateToProject && (
            <div className="lg:col-span-1">
              <AllocationSummary
                equipmentName={formData.name || 'New Equipment'}
                projectName={getProjectName()}
                operatorName={getOperatorName()}
                operatorType={allocationData.operatorType}
                startDate={allocationData.startDate}
                endDate={allocationData.endDate}
                taskTitle={getTaskTitle()}
                notes={allocationData.notes}
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
};
