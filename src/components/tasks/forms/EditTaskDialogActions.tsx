
import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EditTaskDialogActionsProps {
  loading: boolean;
  hasErrors: boolean;
  titleEmpty: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const EditTaskDialogActions: React.FC<EditTaskDialogActionsProps> = ({
  loading,
  hasErrors,
  titleEmpty,
  onCancel,
  onSubmit
}) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={loading}
        className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
      >
        Cancel
      </Button>
      <Button 
        type="button"
        onClick={onSubmit}
        disabled={loading || titleEmpty || hasErrors}
        className="bg-orange-600 hover:bg-orange-700 transition-colors duration-200 focus:ring-2 focus:ring-orange-300"
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Updating...
          </>
        ) : (
          'Update Task'
        )}
      </Button>
    </div>
  );
};
