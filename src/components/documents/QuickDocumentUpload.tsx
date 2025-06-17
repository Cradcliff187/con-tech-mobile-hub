
import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentUpload } from './DocumentUpload';

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
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'action') {
    return {
      id: 'upload-document',
      label: 'Upload Document',
      icon: Upload,
      action: () => setIsOpen(true),
      shortcut: 'Ctrl+U'
    };
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 ${className}`}
        size="sm"
      >
        <Upload size={16} className="mr-2" />
        Upload
      </Button>
      
      {isOpen && (
        <DocumentUpload
          projectId={projectId}
          onUploadComplete={() => {
            onUploadComplete?.();
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};
