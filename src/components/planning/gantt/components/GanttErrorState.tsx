
import { AlertTriangle } from 'lucide-react';

interface GanttErrorStateProps {
  error: string;
}

export const GanttErrorState = ({ error }: GanttErrorStateProps) => {
  return (
    <div className="text-center py-12">
      <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
      <h3 className="text-lg font-medium text-slate-600 mb-2">Error Loading Tasks</h3>
      <p className="text-slate-500">{error}</p>
    </div>
  );
};
