
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DocumentPreview } from './DocumentPreview';

interface DocumentRecord {
  id: string;
  name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  created_at: string;
  uploader?: {
    full_name?: string;
    email: string;
  };
}

interface DocumentPreviewDialogProps {
  document: DocumentRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
}

export const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({
  document,
  open,
  onOpenChange,
  onDownload
}) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-[80vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Document Preview</DialogTitle>
        </DialogHeader>
        <div className="h-full overflow-hidden">
          <DocumentPreview
            document={document}
            onClose={() => onOpenChange(false)}
            onDownload={onDownload}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
