import React from 'react';
import { Task } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Calendar, Clock, User } from 'lucide-react';
import { TaskDocumentAttachments } from './TaskDocumentAttachments';
import { format } from 'date-fns';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TaskGridItemProps {
  task: Task & {
    project?: {
      id: string;
      name: string;
      status?: string;
      phase?: string;
      unified_lifecycle_status?: string;
    };
    assignee?: {
      id: string;
      full_name?: string;
      email: string;
      avatar_url?: string;
    };
    assigned_stakeholder?: {
      id: string;
      contact_person?: string;
      company_name?: string;
      stakeholder_type: string;
    };
    stakeholder_assignments?: Array<{
      id: string;
      stakeholder: {
        id: string;
        contact_person?: string;
        company_name?: string;
        stakeholder_type: string;
      };
      assignment_role?: string;
    }>;
  };
  onEdit: (task: Task) => void;
  onViewDetails: (task: Task) => void;
  isSelected?: boolean;
}

export const TaskGridItem: React.FC<TaskGridItemProps> = ({ 
  task, 
  onEdit, 
  onViewDetails, 
  isSelected = false 
}) => {
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTask(task.id, { status: newStatus as Task['status'] });
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/?section=projects&project=${projectId}`);
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  // Get assignment info
  const getAssignmentInfo = () => {
    if (task.stakeholder_assignments && task.stakeholder_assignments.length > 0) {
      const count = task.stakeholder_assignments.length;
      const first = task.stakeholder_assignments[0];
      return {
        displayName: first.stakeholder.contact_person || first.stakeholder.company_name || 'Unnamed',
        count
      };
    }
    if (task.assigned_stakeholder) {
      return {
        displayName: task.assigned_stakeholder.contact_person || task.assigned_stakeholder.company_name || 'Unnamed',
        count: 1
      };
    }
    if (task.assignee) {
      return {
        displayName: task.assignee.full_name || task.assignee.email,
        count: 1
      };
    }
    return null;
  };

  const assignmentInfo = getAssignmentInfo();

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200 hover:shadow-md h-full flex flex-col
      ${isSelected ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}
      ${isOverdue ? 'border-red-300 bg-red-50' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
          <h3 className="font-medium text-slate-800 truncate text-sm leading-tight">
            {task.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDetails(task)}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"
          >
            <Eye size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onEdit(task)}
            className="h-7 w-7 p-0 text-slate-500 hover:text-slate-700"
          >
            <Edit size={14} />
          </Button>
        </div>
      </div>

      {/* Task Type Badge */}
      {task.task_type === 'punch_list' && (
        <div className="mb-2">
          <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
            Punch List
          </Badge>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Project */}
      {task.project && (
        <div className="mb-3">
          <button
            onClick={() => handleProjectClick(task.project!.id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium truncate block w-full text-left"
          >
            {task.project.name}
          </button>
        </div>
      )}

      {/* Assignment */}
      {assignmentInfo && (
        <div className="flex items-center gap-1 mb-3 text-xs text-slate-600">
          <User size={12} />
          <span className="truncate">
            {assignmentInfo.displayName}
            {assignmentInfo.count > 1 && ` +${assignmentInfo.count - 1}`}
          </span>
        </div>
      )}

      {/* Status and Progress */}
      <div className="mb-3">
        <GlobalStatusDropdown
          entityType="task"
          currentStatus={task.status}
          onStatusChange={handleStatusChange}
          size="sm"
          confirmCriticalChanges={true}
        />
        {task.progress !== undefined && task.progress > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer - Due Date and Hours */}
      <div className="mt-auto space-y-2">
        {/* Due Date */}
        {task.due_date && (
          <div className={`flex items-center gap-1 text-xs ${
            isOverdue ? 'text-red-600' : 'text-slate-500'
          }`}>
            <Calendar size={12} />
            <span>{format(new Date(task.due_date), 'MMM d')}</span>
            {isOverdue && <span className="font-medium">(Overdue)</span>}
          </div>
        )}

        {/* Hours */}
        {task.estimated_hours && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock size={12} />
            <span>{task.estimated_hours}h est.</span>
            {task.actual_hours && (
              <span className="text-slate-400">
                / {task.actual_hours}h actual
              </span>
            )}
          </div>
        )}

        {/* Skills */}
        {task.required_skills && task.required_skills.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {task.required_skills.slice(0, 2).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {skill}
              </Badge>
            ))}
            {task.required_skills.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{task.required_skills.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Document Attachments */}
        <div className="flex justify-end">
          <TaskDocumentAttachments task={task} compact />
        </div>
      </div>
    </div>
  );
};