
import React from 'react';
import { Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileTypeInfo, formatFileSize } from '@/utils/fileTypeHelpers';

interface DocumentRecord {
  id: string;
  project_id?: string;
  name: string;
  file_path: string;
  file_size?: number;
  file_type?: string;
  category?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  uploader?: {
    full_name?: string;
    email: string;
  };
  project?: {
    name: string;
  };
}

interface PreviewContentProps {
  document: DocumentRecord;
  previewUrl: string | null;
  textContent: string | null;
  loading: boolean;
  error: string | null;
  zoom: number;
  onRetry: () => void;
  onDownload: () => void;
}

export const PreviewContent: React.FC<PreviewContentProps> = ({
  document,
  previewUrl,
  textContent,
  loading,
  error,
  zoom,
  onRetry,
  onDownload
}) => {
  const fileTypeInfo = getFileTypeInfo(document.file_type, document.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        <span className="ml-2 text-slate-600">Loading preview...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={onRetry} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!fileTypeInfo.canPreview) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="mb-4">
          <div className="text-4xl mb-2">📄</div>
          <h3 className="text-lg font-medium text-slate-800">{fileTypeInfo.displayName}</h3>
          <p className="text-slate-600 mt-2">Preview not available for this file type</p>
          <p className="text-sm text-slate-500 mt-1">
            Size: {formatFileSize(document.file_size)}
          </p>
        </div>
        <Button onClick={onDownload} className="flex items-center gap-2">
          <Download size={16} />
          Download to View
        </Button>
      </div>
    );
  }

  switch (fileTypeInfo.category) {
    case 'pdf':
      return (
        <div className="w-full h-full">
          <iframe
            src={previewUrl || ''}
            className="w-full h-full border-0"
            title={document.name}
            style={{ minHeight: '500px' }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="flex items-center justify-center p-4">
          <img
            src={previewUrl || ''}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transition: 'transform 0.2s ease'
            }}
          />
        </div>
      );

    case 'text':
      return (
        <div className="p-4">
          <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 p-4 rounded-lg overflow-auto max-h-96">
            {textContent}
          </pre>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-slate-600">Preview not supported</p>
        </div>
      );
  }
};
