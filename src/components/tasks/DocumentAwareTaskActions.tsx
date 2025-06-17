
import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/database';
import { useTaskDocuments } from '@/hooks/useTaskDocuments';

interface DocumentAwareTaskActionsProps {
  task: Task;
  onOpenDocuments: () => void;
}

export const DocumentAwareTaskActions: React.FC<DocumentAwareTaskActionsProps> = ({
  task,
  onOpenDocuments
}) => {
  const { taskDocuments, loading } = useTaskDocuments(task.id);

  if (loading) return null;

  const requiredDocs = taskDocuments.filter(td => td.relationship_type === 'requirement');
  const totalDocs = taskDocuments.length;
  const hasRequiredDocs = requiredDocs.length > 0;
  const hasDocuments = totalDocs > 0;

  // Show warning for tasks without required documents in certain phases
  const needsDocuments = task.task_type === 'punch_list' || task.status === 'in-progress';
  const showWarning = needsDocuments && !hasDocuments;

  return (
    <div className="flex items-center gap-2">
      {showWarning && (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertTriangle size={16} />
          <span className="text-sm">No documents</span>
        </div>
      )}

      {hasDocuments && (
        <Button
          onClick={onOpenDocuments}
          variant="ghost"
          size="sm"
          className="h-8 text-slate-600 hover:text-slate-800"
        >
          <FileText size={16} className="mr-1" />
          <span>{totalDocs}</span>
          {hasRequiredDocs && (
            <Badge variant="destructive" className="ml-1 text-xs h-4">
              {requiredDocs.length} req
            </Badge>
          )}
        </Button>
      )}

      {!hasDocuments && !showWarning && (
        <Button
          onClick={onOpenDocuments}
          variant="ghost"
          size="sm"
          className="h-8 text-slate-400 hover:text-slate-600"
        >
          <FileText size={16} className="mr-1" />
          <span className="text-sm">Add docs</span>
        </Button>
      )}
    </div>
  );
};
