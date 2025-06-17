
import { ResponsiveDialog } from '@/components/common/ResponsiveDialog';
import { TaskDetails } from '@/components/timeline/TaskDetails';
import { Task } from '@/types/database';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export const TaskDetailsDialog = ({ open, onOpenChange, task }: TaskDetailsDialogProps) => {
  if (!task) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Task Details: ${task.title}`}
      className="max-w-2xl"
    >
      <TaskDetails
        taskId={task.id}
        task={{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          assignee_id: task.assignee_id,
          assigned_stakeholder_id: task.assigned_stakeholder_id
        }}
      />
    </ResponsiveDialog>
  );
};
