
import { useState } from 'react';
import { useStakeholderAssignments } from '@/hooks/useStakeholderAssignments';
import { useEmployeeAssignments } from '@/hooks/useEmployeeAssignments';
import { Stakeholder } from '@/hooks/useStakeholders';
import { useTasks } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAssignmentForm } from '@/hooks/useAssignmentForm';
import { ProjectSelectionField } from './assignment/ProjectSelectionField';
import { TaskSelectionField } from './assignment/TaskSelectionField';
import { AssignmentFormFields } from './assignment/AssignmentFormFields';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AssignStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
}

export const AssignStakeholderDialog = ({ open, onOpenChange, stakeholder }: AssignStakeholderDialogProps) => {
  const { createAssignment } = useStakeholderAssignments();
  const { assignEmployee } = useEmployeeAssignments();
  const { tasks } = useTasks();
  const { toast } = useToast();
  const { 
    formData, 
    setFormData, 
    selectedProject, 
    projects, 
    resetForm,
    estimatedCost,
    estimatedHoursFromDuration,
    validation
  } = useAssignmentForm(stakeholder, open);
  const [loading, setLoading] = useState(false);

  const isEmployee = stakeholder?.stakeholder_type === 'employee';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stakeholder || !formData.project_id) {
      toast({
        title: "Validation Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors[0],
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const assignmentData = {
      stakeholder_id: stakeholder.id,
      project_id: formData.project_id,
      task_id: formData.task_id !== 'none' ? formData.task_id : undefined,
      role: formData.role || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      total_hours: formData.total_hours ? parseFloat(formData.total_hours) : undefined,
      notes: formData.notes || undefined,
      status: 'assigned'
    };

    let result;

    if (isEmployee) {
      // Use employee-specific assignment logic
      result = await assignEmployee(assignmentData);
    } else {
      // Use general stakeholder assignment logic
      result = await createAssignment(assignmentData);
    }
    
    if (!result.error) {
      resetForm();
      onOpenChange(false);
      toast({
        title: "Success",
        description: isEmployee 
          ? `Employee assigned successfully. Total cost: $${estimatedCost.toLocaleString()}`
          : "Stakeholder assigned successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId, task_id: 'none' }));
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const availableTasks = tasks.filter(t => t.project_id === formData.project_id);

  if (!stakeholder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Assign {stakeholder.company_name} to Project
            {isEmployee && (
              <Badge variant="secondary" className="text-xs">
                Employee
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProjectSelectionField
            value={formData.project_id}
            onChange={handleProjectChange}
            projects={projects}
            selectedProject={selectedProject}
            stakeholder={stakeholder}
          />

          <TaskSelectionField
            value={formData.task_id}
            onChange={(value) => handleFieldChange('task_id', value)}
            tasks={availableTasks}
            stakeholder={stakeholder}
            projectSelected={!!selectedProject}
          />

          <AssignmentFormFields
            formData={formData}
            onChange={handleFieldChange}
            stakeholder={stakeholder}
            estimatedCost={estimatedCost}
            estimatedHoursFromDuration={estimatedHoursFromDuration}
            validation={validation}
          />

          {/* Validation Summary */}
          {!validation.isValid && validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle size={16} />
                <span className="font-medium">Please address the following issues:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Preview */}
          {validation.isValid && isEmployee && estimatedCost > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <CheckCircle size={16} />
                <span className="font-medium">Ready to assign</span>
              </div>
              <p className="text-sm text-green-700">
                This assignment will cost ${estimatedCost.toLocaleString()} 
                ({formData.total_hours} hours × ${formData.hourly_rate}/hr)
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.project_id || !validation.isValid} 
              className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Assigning...' : 'Assign to Project'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
