
import { ChevronDown, ChevronRight, Calendar, User, AlertTriangle, Plus, Edit, Eye, MoreHorizontal, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { HierarchyTask } from '@/types/hierarchy';
import { useIsMobile } from '@/hooks/use-mobile';
import { CategoryRenameDialog } from '@/components/common/CategoryRenameDialog';

interface TaskHierarchyRowProps {
  task: HierarchyTask;
  level?: number;
  isSelected?: boolean;
  onSelect?: (taskId: string) => void;
  onToggleExpanded: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'not-started' | 'in-progress' | 'completed' | 'blocked') => void;
  onAddTask: (category?: string) => void;
  onEditTask?: (taskId: string) => void;
  onViewTask?: (taskId: string) => void;
  onDuplicateTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onCategoryRename?: (oldName: string, newName: string) => void;
  canEdit?: boolean;
  isUpdating?: boolean;
}

export const TaskHierarchyRow = ({ 
  task, 
  level = 0,
  isSelected = false,
  onSelect,
  onToggleExpanded, 
  onStatusChange, 
  onAddTask,
  onEditTask,
  onViewTask,
  onDuplicateTask,
  onDeleteTask,
  onCategoryRename,
  canEdit = true,
  isUpdating = false
}: TaskHierarchyRowProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const isMobile = useIsMobile();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-600" />;
      case 'high': return <AlertTriangle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const isCategory = task.status === 'category';

  return (
    <>
      <div 
        className={`flex items-center gap-2 md:gap-3 py-3 px-4 border-b border-slate-200 hover:bg-slate-50 group transition-colors cursor-pointer ${
          level > 0 ? 'bg-slate-25' : ''
        } ${isSelected ? 'bg-blue-50 border-blue-200' : ''} ${isUpdating ? 'opacity-50' : ''}`}
        style={{ paddingLeft: isMobile ? `${8 + level * 16}px` : `${16 + level * 24}px` }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect?.(task.id)}
      >
        {/* Expand/Collapse */}
        {task.children.length > 0 ? (
          <button
            onClick={(e) => handleActionClick(e, () => onToggleExpanded(task.id))}
            className={`text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center ${
              isMobile ? 'min-h-[44px] min-w-[44px]' : ''
            }`}
          >
            {task.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1 min-w-0">
          {/* Task Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
              <div className="flex items-center gap-2">
                {getPriorityIcon(task.priority)}
                <span className={`text-sm font-medium ${level === 0 ? 'text-slate-800' : 'text-slate-700'}`}>
                  {task.title}
                </span>
              </div>
              {!isCategory && (
                <div onClick={(e) => e.stopPropagation()}>
                  <GlobalStatusDropdown
                    entityType="task"
                    currentStatus={task.status}
                    onStatusChange={(newStatus) => onStatusChange(task.id, newStatus as 'not-started' | 'in-progress' | 'completed' | 'blocked')}
                    size="sm"
                    confirmCriticalChanges={true}
                    disabled={!canEdit}
                  />
                </div>
              )}
            </div>
            {task.dueDate && (
              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                <Calendar size={12} />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Progress & Actions Section */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <div className="flex items-center gap-3">
              {/* Progress */}
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
              {task.assignee && !isCategory && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <User size={12} />
                  <span className="hidden md:inline">Assigned</span>
                </div>
              )}
            </div>

            {/* Actions - Always visible on mobile, hover on desktop */}
            <div className={`flex items-center gap-1 transition-opacity ${
              isHovered || isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {/* Quick Add Task Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-slate-500 hover:text-slate-700 p-0 ${isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-8 w-8'}`}
                onClick={(e) => handleActionClick(e, () => onAddTask(isCategory ? task.title : task.category))}
                title={isCategory ? 'Add task to this category' : 'Add task to same category'}
              >
                <Plus size={14} />
              </Button>

              {/* Task Actions Menu */}
              {!isCategory && canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`text-slate-500 hover:text-slate-700 p-0 ${isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-8 w-8'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                    <DropdownMenuItem onClick={() => onViewTask?.(task.id)} className="flex items-center gap-2">
                      <Eye size={14} />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditTask?.(task.id)} className="flex items-center gap-2">
                      <Edit size={14} />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDuplicateTask?.(task.id)} className="flex items-center gap-2">
                      <Copy size={14} />
                      Duplicate Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDeleteTask?.(task.id)} 
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <Trash2 size={14} />
                      Delete Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Category Actions Menu */}
              {isCategory && canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`text-slate-500 hover:text-slate-700 p-0 ${isMobile ? 'min-h-[44px] min-w-[44px]' : 'h-8 w-8'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                    <DropdownMenuItem onClick={() => onAddTask(task.title)} className="flex items-center gap-2">
                      <Plus size={14} />
                      Add Task to Category
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem 
                       onClick={() => setIsRenaming(true)}
                       className="flex items-center gap-2"
                     >
                       <Edit size={14} />
                       Rename Category
                     </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
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
          onEditTask={onEditTask}
          onViewTask={onViewTask}
          onDuplicateTask={onDuplicateTask}
          onDeleteTask={onDeleteTask}
          onCategoryRename={onCategoryRename}
          canEdit={canEdit}
          isUpdating={isUpdating}
        />
      ))}

      {/* Category Rename Dialog */}
      {isCategory && (
        <CategoryRenameDialog
          open={isRenaming}
          onOpenChange={setIsRenaming}
          currentName={task.title}
          onRename={async (oldName, newName) => {
            if (onCategoryRename) {
              await onCategoryRename(oldName, newName);
              return { success: true };
            }
            return { success: false, error: 'Rename function not available' };
          }}
        />
      )}
    </>
  );
};
