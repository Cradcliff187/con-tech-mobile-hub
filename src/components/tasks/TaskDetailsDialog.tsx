
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task } from '@/types/database';

// Enhanced task type with assignments
interface EnhancedTask extends Task {
  stakeholder_assignments?: Array<{
    id: string;
    stakeholder: {
      id: string;
      contact_person?: string;
      company_name?: string;
      stakeholder_type: string;
    };
    assignment_role?: string;
    status: string;
  }>;
}
import { TaskDocumentAttachments } from './TaskDocumentAttachments';
import { ProjectContextPanel } from './ProjectContextPanel';
import { SmartStakeholderAssignment } from './SmartStakeholderAssignment';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Edit, Users, Building2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TaskDetailsDialogProps {
  task: EnhancedTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditRequest?: (task: EnhancedTask) => void;
}

export const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ 
  task, 
  open, 
  onOpenChange,
  onEditRequest
}) => {
  const [showSmartReassignment, setShowSmartReassignment] = useState(false);
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { updateTask } = useTasks();
  const { toast } = useToast();

  if (!task) return null;

  const project = projects.find(p => p.id === task.project_id);
  
  // Use junction table data instead of legacy fields
  const activeAssignments = task.stakeholder_assignments?.filter(
    assignment => assignment.status === 'active'
  ) || [];
  
  const assignedStakeholders = activeAssignments.map(assignment => ({
    ...assignment.stakeholder,
    assignment_role: assignment.assignment_role
  }));

  const existingAssignments = activeAssignments.map(
    assignment => assignment.stakeholder.id
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStakeholderReassignment = async (stakeholderIds: string[]) => {
    try {
      console.log('Starting stakeholder reassignment:', { taskId: task.id, stakeholderIds });
      
      const updateData: any = {};
      
      if (stakeholderIds.length === 1) {
        updateData.assigned_stakeholder_id = stakeholderIds[0];
        updateData.assigned_stakeholder_ids = null;
      } else if (stakeholderIds.length > 1) {
        updateData.assigned_stakeholder_id = null;
        updateData.assigned_stakeholder_ids = stakeholderIds;
      } else {
        updateData.assigned_stakeholder_id = null;
        updateData.assigned_stakeholder_ids = null;
      }

      console.log('Update data prepared:', updateData);

      const result = await updateTask(task.id, updateData);
      
      if (result.error) {
        console.error('UpdateTask returned error:', result.error);
        throw new Error(result.error);
      }
      
      console.log('Stakeholder reassignment successful');
      
      toast({
        title: "Assignment Updated",
        description: "Task stakeholder assignment has been updated successfully.",
      });

      setShowSmartReassignment(false);
    } catch (error) {
      console.error('Error in handleStakeholderReassignment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Update Failed", 
        description: `Failed to update task assignment: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleEditRequest = () => {
    if (onEditRequest) {
      onEditRequest(task);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold text-slate-800">
              {task.title}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditRequest}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Task
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 h-full">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ScrollArea className="h-[calc(85vh-120px)]">
              <div className="space-y-6 pr-4">
                {/* Task Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="mt-1">
                      <GlobalStatusDropdown
                        entityType="task"
                        currentStatus={task.status}
                        onStatusChange={() => {}}
                        showAsDropdown={false}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Priority</label>
                    <div className="mt-1">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  {task.due_date && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Due Date</label>
                      <p className="text-sm text-slate-800 mt-1">
                        {format(new Date(task.due_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}
                  {task.progress !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Progress</label>
                      <p className="text-sm text-slate-800 mt-1">{task.progress}%</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {task.description && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Description</label>
                    <p className="text-sm text-slate-800 mt-1 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}

                 {/* Assignment Section - Always Show */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-600">Assigned Stakeholders</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSmartReassignment(!showSmartReassignment)}
                      className="flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      {showSmartReassignment ? 'Hide' : 'Smart'} Reassignment
                    </Button>
                  </div>
                  {assignedStakeholders.length > 0 ? (
                    <div className="space-y-2">
                      {assignedStakeholders.map((stakeholder) => (
                        <div key={stakeholder.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-slate-900">
                              {stakeholder.company_name || stakeholder.contact_person}
                            </div>
                            <div className="text-sm text-slate-600">
                              {stakeholder.stakeholder_type}
                              {stakeholder.assignment_role && ` • ${stakeholder.assignment_role}`}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {stakeholder.stakeholder_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                      <span className="text-sm text-slate-500">No stakeholders assigned</span>
                    </div>
                  )}
                </div>

                {/* Smart Reassignment Panel */}
                {showSmartReassignment && (
                  <div>
                    <Separator className="mb-4" />
                    <div className="mb-3 flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Reassignment will affect project timeline</span>
                    </div>
                    <SmartStakeholderAssignment
                      projectId={task.project_id}
                      requiredSkills={task.required_skills || []}
                      selectedStakeholderIds={existingAssignments}
                      onSelectionChange={handleStakeholderReassignment}
                      taskPriority={task.priority || 'medium'}
                      estimatedHours={task.estimated_hours}
                      dueDate={task.due_date}
                      existingAssignments={existingAssignments}
                    />
                  </div>
                )}

                {/* Task Type and Category */}
                <div className="grid grid-cols-2 gap-4">
                  {task.task_type && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Task Type</label>
                      <p className="text-sm text-slate-800 mt-1 capitalize">
                        {task.task_type.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  {task.category && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Category</label>
                      <p className="text-sm text-slate-800 mt-1">{task.category}</p>
                    </div>
                  )}
                </div>

                {/* Hours */}
                {(task.estimated_hours || task.actual_hours) && (
                  <div className="grid grid-cols-2 gap-4">
                    {task.estimated_hours && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Estimated Hours</label>
                        <p className="text-sm text-slate-800 mt-1">{task.estimated_hours}h</p>
                      </div>
                    )}
                    {task.actual_hours && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Actual Hours</label>
                        <p className="text-sm text-slate-800 mt-1">{task.actual_hours}h</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Required Skills */}
                {task.required_skills && task.required_skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Required Skills</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {task.required_skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Punch List Category */}
                {task.task_type === 'punch_list' && task.punch_list_category && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Punch List Category</label>
                    <Badge className="mt-1 bg-orange-100 text-orange-800">
                      {task.punch_list_category}
                    </Badge>
                  </div>
                )}

                {/* Document Attachments */}
                <div className="border-t border-slate-200 pt-4">
                  <TaskDocumentAttachments task={task} />
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
                  <div>
                    <span className="font-medium">Created:</span> {format(new Date(task.created_at), 'MMM d, yyyy HH:mm')}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {format(new Date(task.updated_at), 'MMM d, yyyy HH:mm')}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Context Sidebar */}
          <div className="w-80 flex-shrink-0">
            <ProjectContextPanel project={project || null} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
