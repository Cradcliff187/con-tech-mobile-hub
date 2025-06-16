import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { ChevronDown, ChevronRight, Calendar, User, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddCategoryDialog } from './AddCategoryDialog';
import { AddTaskDialog } from './AddTaskDialog';

interface TaskHierarchyProps {
  projectId: string;
}

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

export const TaskHierarchy = ({ projectId }: TaskHierarchyProps) => {
  const { tasks } = useTasks();
  const [hierarchyTasks, setHierarchyTasks] = useState<HierarchyTask[]>([]);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  useEffect(() => {
    // Filter and organize tasks into hierarchy
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    
    // Group by category for basic hierarchy
    const categories = new Set(projectTasks.map(task => task.category || 'Uncategorized'));
    
    const hierarchy: HierarchyTask[] = Array.from(categories).map(category => ({
      id: `category-${category}`,
      title: category,
      status: 'category',
      priority: 'medium',
      progress: 0,
      category,
      children: projectTasks
        .filter(task => (task.category || 'Uncategorized') === category)
        .map(task => ({
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          progress: task.progress || 0,
          dueDate: task.due_date,
          assignee: task.assignee_id,
          category: task.category,
          children: []
        })),
      expanded: true
    }));

    // Calculate category progress
    hierarchy.forEach(category => {
      if (category.children.length > 0) {
        category.progress = Math.round(
          category.children.reduce((sum, child) => sum + child.progress, 0) / category.children.length
        );
      }
    });

    setHierarchyTasks(hierarchy);
  }, [tasks, projectId]);

  const toggleExpanded = (taskId: string) => {
    setHierarchyTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, expanded: !task.expanded }
          : task
      )
    );
  };

  const handleAddTask = (category?: string) => {
    setSelectedCategory(category);
    setShowAddTaskDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'blocked': return 'text-red-600 bg-red-100';
      case 'category': return 'text-slate-700 bg-slate-100';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-600" />;
      case 'high': return <AlertTriangle size={14} className="text-orange-600" />;
      default: return null;
    }
  };

  const TaskRow = ({ task, level = 0 }: { task: HierarchyTask; level?: number }) => (
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
            onClick={() => toggleExpanded(task.id)}
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
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
            onClick={() => handleAddTask(task.status === 'category' ? task.title : task.category)}
            title={task.status === 'category' ? 'Add task to this category' : 'Add task to same category'}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Children */}
      {task.expanded && task.children.map(child => (
        <TaskRow key={child.id} task={child} level={level + 1} />
      ))}
    </>
  );

  if (hierarchyTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Tasks Found</h3>
        <p className="text-slate-500 mb-4">Add tasks to this project to see the hierarchy view.</p>
        <Button 
          onClick={() => setShowAddCategoryDialog(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus size={16} className="mr-2" />
          Create First Category
        </Button>
        
        <AddCategoryDialog
          open={showAddCategoryDialog}
          onOpenChange={setShowAddCategoryDialog}
          projectId={projectId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Task Hierarchy</h3>
        <Button 
          size="sm" 
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => setShowAddCategoryDialog(true)}
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-4" />
            <span className="flex-1 text-sm font-medium text-slate-700">Task</span>
            <span className="w-20 text-sm font-medium text-slate-700 text-center">Progress</span>
            <span className="w-20 text-sm font-medium text-slate-700 text-center">Assignee</span>
            <div className="w-8" />
          </div>
        </div>

        {/* Tasks */}
        <div className="max-h-96 overflow-y-auto">
          {hierarchyTasks.map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {hierarchyTasks.reduce((sum, cat) => sum + cat.children.length, 0)}
          </div>
          <div className="text-sm text-blue-800">Total Tasks</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'completed').length, 0)}
          </div>
          <div className="text-sm text-green-800">Completed</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'in-progress').length, 0)}
          </div>
          <div className="text-sm text-orange-800">In Progress</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">
            {hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'blocked').length, 0)}
          </div>
          <div className="text-sm text-red-800">Blocked</div>
        </div>
      </div>

      {/* Dialogs */}
      <AddCategoryDialog
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
        projectId={projectId}
      />
      
      <AddTaskDialog
        open={showAddTaskDialog}
        onOpenChange={setShowAddTaskDialog}
        projectId={projectId}
        category={selectedCategory}
      />
    </div>
  );
};
