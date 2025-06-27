
import React from 'react';
import { Task } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import { ProjectInfo } from '@/components/tasks/ProjectInfo';
import { StakeholderInfo } from '@/components/tasks/StakeholderInfo';
import { useNavigate } from 'react-router-dom';

interface SimpleTaskCardProps {
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
  isSelected: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (taskId: string) => void;
}

export const SimpleTaskCard = ({ 
  task, 
  isSelected, 
  onClick, 
  isCollapsed = false, 
  onToggleCollapse 
}: SimpleTaskCardProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDateRange = () => {
    if (!task.start_date || !task.due_date) return 'No dates set';
    
    const start = new Date(task.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  const handleCollapseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse(task.id);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/?section=projects&project=${projectId}`);
  };

  if (isCollapsed) {
    return (
      <div 
        className={`p-2 cursor-pointer transition-all duration-200 ${
          isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-25'
        }`}
        onClick={onClick}
        style={{ height: '32px' }}
      >
        <div className="flex items-center gap-2 h-full">
          {/* Collapse/Expand button */}
          <button
            onClick={handleCollapseToggle}
            className="flex-shrink-0 p-0.5 hover:bg-slate-200 rounded transition-colors"
          >
            <ChevronRight className="h-3 w-3 text-slate-600" />
          </button>

          {/* Task title - truncated */}
          <h4 className="text-sm font-medium text-slate-800 truncate flex-1 min-w-0">
            {task.title}
          </h4>

          {/* Project badge - small */}
          {task.project && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
              {task.project.name.substring(0, 8)}...
            </Badge>
          )}

          {/* Status badge - small */}
          <Badge className={`text-xs px-1.5 py-0 ${getStatusColor(task.status)}`}>
            {task.status.charAt(0).toUpperCase()}
          </Badge>

          {/* Stakeholder indicator */}
          <StakeholderInfo
            assignee={task.assignee}
            assignedStakeholder={task.assigned_stakeholder}
            stakeholderAssignments={task.stakeholder_assignments}
            size="sm"
            compact
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-3 cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-slate-25'
      }`}
      onClick={onClick}
      style={{ minHeight: '64px' }}
    >
      <div className="flex items-start gap-2 mb-2">
        {/* Collapse/Expand button */}
        <button
          onClick={handleCollapseToggle}
          className="flex-shrink-0 p-0.5 hover:bg-slate-200 rounded transition-colors mt-0.5"
        >
          <ChevronDown className="h-3 w-3 text-slate-600" />
        </button>

        {/* Title */}
        <h4 className="text-sm font-medium text-slate-800 line-clamp-2 flex-1">
          {task.title}
        </h4>
      </div>

      {/* Project Information */}
      <div className="mb-2 pl-5">
        <ProjectInfo 
          project={task.project} 
          onProjectClick={handleProjectClick}
          size="sm"
          showStatus={false}
        />
      </div>

      {/* Status and Category */}
      <div className="flex gap-2 mb-2 pl-5">
        <Badge className={`text-xs ${getStatusColor(task.status)}`}>
          {task.status}
        </Badge>
        {task.category && (
          <Badge variant="outline" className="text-xs">
            {task.category}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="mb-2 pl-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-600">Progress</span>
          <span className="text-xs font-medium">{task.progress || 0}%</span>
        </div>
        <Progress value={task.progress || 0} className="h-1" />
      </div>

      {/* Dates */}
      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1 pl-5">
        <Clock size={10} />
        {formatDateRange()}
      </div>

      {/* Stakeholder Assignment */}
      <div className="pl-5">
        <StakeholderInfo
          assignee={task.assignee}
          assignedStakeholder={task.assigned_stakeholder}
          stakeholderAssignments={task.stakeholder_assignments}
          size="sm"
        />
      </div>
    </div>
  );
};
