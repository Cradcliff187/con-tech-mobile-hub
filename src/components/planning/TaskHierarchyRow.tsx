
import { ChevronDown, ChevronRight, Calendar, User, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';

interface HierarchyTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  dueDate?: string;
  assignee?: string;
  category?: string;
  children: HierarchyTask[];
  expanded?: boolean;
}

interface TaskHierarchyRowProps {
  task: HierarchyTask;
  level?: number;
  onToggleExpanded: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked') => void;
  onAddTask: (category?: string) => void;
}

export const TaskHierarchyRow = ({ 
  task, 
  level = 0, 
  onToggleExpanded, 
  onStatusChange, 
  onAddTask 
}: TaskHierarchyRowProps) => {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-600" />;
      case 'high': return <AlertTriangle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  return (
    <>
      <div 
        className={`flex items-center gap-3 py-3 px-4 border-b border-slate-200 hover:bg-slate-50 ${
          level > 0 ? 'bg-slate-25' : ''
        }`}
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        {/* Expand/Collapse */}
        {task.children.length > 0 ? (
          <button
            onClick={() => onToggleExpanded(task.id)}
            className="text-slate-500 hover:text-slate-700"
          >
            {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getPriorityIcon(task.priority)}
            <span className={`text-sm font-medium ${level === 0 ? 'text-slate-800' : 'text-slate-700'}`}>
              {task.title}
            </span>
            {task.status !== 'category' && (
              <GlobalStatusDropdown
                entityType="task"
                currentStatus={task.status}
                onStatusChange={(newStatus) => onStatusChange(task.id, newStatus as 'not-started' | 'in-progress' | 'completed' | 'blocked')}
                size="sm"
                confirmCriticalChanges={true}
              />
            )}
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
              <Calendar size={12} />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="w-20">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-slate-600 w-8">{task.progress}%</span>
            </div>
          </div>

          {/* Assignee */}
          {task.assignee && task.status !== 'category' && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User size={12} />
              <span>Assigned</span>
            </div>
          )}

          {/* Actions */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:text-slate-700"
            onClick={() => onAddTask(task.status === 'category' ? task.title : task.category)}
            title={task.status === 'category' ? 'Add task to this category' : 'Add task to same category'}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Children */}
      {task.expanded && task.children.map(child => (
        <TaskHierarchyRow 
          key={child.id} 
          task={child} 
          level={level + 1}
          onToggleExpanded={onToggleExpanded}
          onStatusChange={onStatusChange}
          onAddTask={onAddTask}
        />
      ))}
    </>
  );
};
