
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types/database';

interface TaskActionsProps {
  task: Task;
}

export const TaskActions = ({ task }: TaskActionsProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const { updateTask } = useTasks();
  const { toast } = useToast();

  const handleConvertToPunchList = async () => {
    setIsConverting(true);
    
    try {
      const { error } = await updateTask(task.id, {
        task_type: 'punch_list',
        inspection_status: 'pending'
      });

      if (error) {
        toast({
          title: "Error converting task",
          description: error,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Task converted successfully",
          description: `${task.title} has been converted to a punch list item`
        });
      }
    } catch (error) {
      console.error('Task conversion error:', error);
      toast({
        title: "Error converting task",
        description: "Failed to convert task. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsConverting(false);
  };

  const showConvertToPunchList = task.task_type === 'regular' && (task.progress || 0) > 80;

  if (!showConvertToPunchList) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border shadow-lg">
        <DropdownMenuItem
          onClick={handleConvertToPunchList}
          disabled={isConverting}
        >
          {isConverting ? 'Converting...' : 'Convert to Punch List'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
