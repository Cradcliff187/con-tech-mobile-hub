
import React from 'react';
import { Loader2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileTypeInfo, formatFileSize } from '@/utils/fileTypeHelpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

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
        <LoadingSpinner size="lg" text="Loading preview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <div className="text-orange-500 mb-4">
          <FileText size={48} />
        </div>
        <p className="text-slate-800 font-medium mb-2">Preview Error</p>
        <p className="text-slate-500 mb-4 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button 
            onClick={onRetry} 
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Try Again
          </Button>
          <Button 
            onClick={onDownload}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Download Instead
          </Button>
        </div>
      </div>
    );
  }

  if (!fileTypeInfo.canPreview) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <div className="mb-4 text-slate-400">
          <FileText size={64} />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">
          {fileTypeInfo.displayName}
        </h3>
        <p className="text-slate-500 mb-2">Preview not available for this file type</p>
        <p className="text-sm text-slate-400 mb-6">
          Size: {formatFileSize(document.file_size)}
        </p>
        <Button 
          onClick={onDownload} 
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Download size={16} />
          Download to View
        </Button>
      </div>
    );
  }

  switch (fileTypeInfo.category) {
    case 'pdf':
      return (
        <div className="w-full h-full bg-slate-50">
          <iframe
            src={previewUrl || ''}
            className="w-full h-full border-0 rounded-b-lg"
            title={document.name}
            style={{ minHeight: '500px' }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="flex items-center justify-center p-4 bg-slate-50 min-h-[500px]">
          <div className="overflow-auto max-w-full max-h-full">
            <img
              src={previewUrl || ''}
              alt={document.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transition: 'transform 0.2s ease'
              }}
            />
          </div>
        </div>
      );

    case 'text':
      return (
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-100">
              <p className="text-sm font-medium text-slate-700">File Contents</p>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-slate-800 p-4 overflow-auto max-h-96 font-mono">
              {textContent}
            </pre>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex items-center justify-center h-96 text-center p-6">
          <div className="text-slate-400">
            <FileText size={48} className="mx-auto mb-4" />
            <p className="text-slate-500">Preview not supported for this file type</p>
          </div>
        </div>
      );
  }
};
