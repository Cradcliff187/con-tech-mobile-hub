
import React from 'react';
import { TaskDocumentAttachmentsEnhanced } from './TaskDocumentAttachmentsEnhanced';
import { Task } from '@/types/database';

interface TaskDocumentAttachmentsProps {
  task: Task;
  compact?: boolean;
}

export const TaskDocumentAttachments: React.FC<TaskDocumentAttachmentsProps> = (props) => {
  return <TaskDocumentAttachmentsEnhanced {...props} />;
};
