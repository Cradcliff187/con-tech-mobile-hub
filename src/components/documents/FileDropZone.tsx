
import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, FolderOpen } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileDropZoneProps {
  isDragOver: boolean;
  selectedFilesCount: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onBrowseFiles: () => void;
  onCameraCapture: () => void;
}

export const FileDropZone = ({
  isDragOver,
  selectedFilesCount,
  onDrop,
  onDragOver,
  onDragLeave,
  onBrowseFiles,
  onCameraCapture
}: FileDropZoneProps) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div
      ref={dropZoneRef}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ease-in-out
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg ring-2 ring-blue-200' 
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }
        ${selectedFilesCount > 0 ? 'border-green-500 bg-green-50' : ''}
      `}
    >
      <div className="space-y-4">
        <div className={`mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center transition-all duration-300 ${
          isDragOver ? 'bg-blue-100 scale-110' : 'hover:bg-slate-200'
        }`}>
          <Upload 
            size={32} 
            className={`transition-all duration-300 ${
              isDragOver ? 'text-blue-500 scale-110' : 'text-slate-400'
            }`} 
          />
        </div>
        <div>
          <p className={`text-lg font-medium transition-colors duration-200 ${
            isDragOver ? 'text-blue-700' : 'text-slate-700'
          }`}>
            {isDragOver ? 'Drop files here' : 'Drag files here to upload'}
          </p>
          <p className="text-sm text-slate-500">
            Or click to browse files
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            type="button"
            onClick={onBrowseFiles}
            variant="outline"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <FolderOpen size={16} />
            Browse Files
          </Button>
          {isMobile && (
            <Button
              type="button"
              onClick={onCameraCapture}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <Camera size={16} />
              Take Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
