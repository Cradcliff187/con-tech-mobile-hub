
import React from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFileTypeInfo, formatFileSize } from '@/utils/fileTypeHelpers';
import { ZoomControls } from './ZoomControls';

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

interface PreviewHeaderProps {
  document: DocumentRecord;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onDownload: () => void;
  onClose?: () => void;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  document,
  zoom,
  onZoomChange,
  onDownload,
  onClose
}) => {
  const fileTypeInfo = getFileTypeInfo(document.file_type, document.name);

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border-b border-slate-200 gap-4">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-slate-800 truncate">
          {document.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-sm text-slate-500 mt-1">
          <span>{fileTypeInfo.displayName}</span>
          <span>{formatFileSize(document.file_size)}</span>
          <span className="hidden sm:inline">
            Uploaded by {document.uploader?.full_name || document.uploader?.email || 'Unknown'}
          </span>
        </div>
        {document.project?.name && (
          <div className="text-sm text-slate-500 mt-1">
            Project: <span className="font-medium">{document.project.name}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
        {fileTypeInfo.category === 'image' && fileTypeInfo.canPreview && (
          <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
        )}
        
        <Button
          onClick={onDownload}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-sm px-3 py-2"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Download</span>
        </Button>
        
        {onClose && (
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-2"
            aria-label="Close preview"
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
