
import React from 'react';
import { Button } from '@/components/ui/button';
import { TaskDocumentAttachments } from '../TaskDocumentAttachments';
import { TaskViewHeader } from './view/TaskViewHeader';
import { TaskViewProgress } from './view/TaskViewProgress';
import { TaskViewDetails } from './view/TaskViewDetails';
import { TaskViewTimestamps } from './view/TaskViewTimestamps';
import { Task } from '@/types/database';

interface EditTaskViewModeProps {
  task: Task;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

export const EditTaskViewMode: React.FC<EditTaskViewModeProps> = ({
  task,
  onClose,
  onSwitchToEdit
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <TaskViewHeader task={task} />

      {/* Progress Section */}
      <TaskViewProgress task={task} />

      {/* Task Details Grid */}
      <TaskViewDetails task={task} />

      {/* Document Attachments */}
      <div>
        <h4 className="text-sm font-medium text-slate-800 mb-3">Document Attachments</h4>
        <TaskDocumentAttachments task={task} />
      </div>

      {/* Timestamps */}
      <TaskViewTimestamps task={task} />

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="transition-colors duration-200 focus:ring-2 focus:ring-slate-300"
        >
          Close
        </Button>
        <Button 
          type="button" 
          onClick={onSwitchToEdit}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-300"
        >
          Switch to Edit
        </Button>
      </div>
    </div>
  );
};
