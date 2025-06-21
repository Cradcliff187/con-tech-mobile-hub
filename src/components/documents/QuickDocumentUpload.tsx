
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartDocumentUpload } from './SmartDocumentUpload';

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
      action: () => {}, // This will be handled by SmartDocumentUpload component
      shortcut: 'Ctrl+U'
    };
  }

  return (
    <SmartDocumentUpload
      projectId={projectId}
      onUploadComplete={onUploadComplete}
      variant="dialog"
      triggerButton={
        <Button
          className={`bg-blue-600 hover:bg-blue-700 ${className}`}
          size="sm"
        >
          <Upload size={16} className="mr-2" />
          Upload
        </Button>
      }
    />
  );
};
