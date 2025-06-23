
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskHierarchyHeaderProps {
  onAddCategory: () => void;
}

export const TaskHierarchyHeader = ({ onAddCategory }: TaskHierarchyHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">Task Hierarchy</h3>
      <Button 
        size="sm" 
        className="bg-orange-600 hover:bg-orange-700"
        onClick={onAddCategory}
      >
        <Plus size={16} className="mr-2" />
        Add Category
      </Button>
    </div>
  );
};
