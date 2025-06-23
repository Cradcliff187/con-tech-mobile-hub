
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

interface TaskHierarchySummaryProps {
  hierarchyTasks: HierarchyTask[];
}

export const TaskHierarchySummary = ({ hierarchyTasks }: TaskHierarchySummaryProps) => {
  const totalTasks = hierarchyTasks.reduce((sum, cat) => sum + cat.children.length, 0);
  const completedTasks = hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'completed').length, 0);
  const inProgressTasks = hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'in-progress').length, 0);
  const blockedTasks = hierarchyTasks.reduce((sum, cat) => sum + cat.children.filter(t => t.status === 'blocked').length, 0);

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
        <div className="text-sm text-blue-800">Total Tasks</div>
      </div>
      <div className="bg-green-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
        <div className="text-sm text-green-800">Completed</div>
      </div>
      <div className="bg-orange-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-orange-600">{inProgressTasks}</div>
        <div className="text-sm text-orange-800">In Progress</div>
      </div>
      <div className="bg-red-50 rounded-lg p-4">
        <div className="text-2xl font-bold text-red-600">{blockedTasks}</div>
        <div className="text-sm text-red-800">Blocked</div>
      </div>
    </div>
  );
};
