
import { AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskHierarchyEmptyStateProps {
  onAddCategory: () => void;
}

export const TaskHierarchyEmptyState = ({ onAddCategory }: TaskHierarchyEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <AlertTriangle size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-medium text-slate-600 mb-2">No Tasks Found</h3>
      <p className="text-slate-500 mb-4">Add tasks to this project to see the hierarchy view.</p>
      <Button 
        onClick={onAddCategory}
        className="bg-orange-600 hover:bg-orange-700"
      >
        <Plus size={16} className="mr-2" />
        Create First Category
      </Button>
    </div>
  );
};
