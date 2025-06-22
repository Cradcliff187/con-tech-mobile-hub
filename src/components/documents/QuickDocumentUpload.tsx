
import { Upload } from 'lucide-react';
import { SmartUploadButton } from './SmartUploadButton';
import { QuickAction } from '@/components/common/quick-actions/types';

interface QuickDocumentUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
  variant?: 'button' | 'action';
  className?: string;
}

export const QuickDocumentUpload = ({ 
  projectId, 
  onUploadComplete,
  variant = 'button',
  className 
}: QuickDocumentUploadProps) => {
  if (variant === 'action') {
    return {
      id: 'upload-document',
      label: 'Upload Document',
      icon: Upload,
      action: () => {}, // This will be handled by SmartUploadButton component
      shortcut: 'Ctrl+U'
    } as QuickAction;
  }

  return (
    <SmartUploadButton
      projectId={projectId}
      onUploadComplete={onUploadComplete}
      variant="compact"
      size="sm"
      className={className}
    />
  );
};
