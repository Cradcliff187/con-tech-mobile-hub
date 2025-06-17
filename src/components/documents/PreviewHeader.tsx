
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
    <div className="flex items-center justify-between p-4 border-b border-slate-200">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-slate-800 truncate">
          {document.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
          <span>{fileTypeInfo.displayName}</span>
          <span>{formatFileSize(document.file_size)}</span>
          <span>
            Uploaded by {document.uploader?.full_name || document.uploader?.email || 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {fileTypeInfo.category === 'image' && fileTypeInfo.canPreview && (
          <ZoomControls zoom={zoom} onZoomChange={onZoomChange} />
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Download
        </Button>
        
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
