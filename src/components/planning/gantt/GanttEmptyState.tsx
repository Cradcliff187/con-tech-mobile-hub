
import { Calendar, Wrench } from 'lucide-react';

interface GanttEmptyStateProps {
  projectId: string;
}

export const GanttEmptyState = ({ projectId }: GanttEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
      <h3 className="text-lg font-medium text-slate-600 mb-2">No Construction Tasks Found</h3>
      <p className="text-slate-500">
        {projectId && projectId !== 'all' 
          ? 'Add construction tasks to this project to see the project timeline and dependencies.'
          : 'Create a construction project and add tasks to see the Gantt chart timeline.'
        }
      </p>
      <p className="text-sm text-slate-400 mt-2 flex items-center justify-center gap-1">
        <Wrench size={14} />
        Tasks can include foundations, framing, electrical, plumbing, HVAC, and finishing work.
      </p>
    </div>
  );
};
