
import { useRef, useCallback, memo } from 'react';
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

export const FileDropZone = memo(({
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
        w-full max-w-full box-border
        border-2 border-dashed rounded-lg text-center transition-all duration-300 ease-in-out
        touch-manipulation p-3 min-h-[120px]
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-md ring-1 ring-blue-200' 
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }
        ${selectedFilesCount > 0 ? 'border-green-500 bg-green-50' : ''}
      `}
      role="button"
      tabIndex={0}
      aria-label="File drop zone"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBrowseFiles();
        }
      }}
    >
      <div className="space-y-2 w-full max-w-full">
        <div className={`mx-auto bg-slate-100 rounded-full flex items-center justify-center transition-all duration-300 ${
          isMobile ? 'w-10 h-10' : 'w-8 h-8'
        } ${isDragOver ? 'bg-blue-100 scale-110' : 'hover:bg-slate-200'}`}>
          <Upload 
            size={isMobile ? 20 : 16} 
            className={`transition-all duration-300 ${
              isDragOver ? 'text-blue-500 scale-110' : 'text-slate-400'
            }`} 
          />
        </div>
        <div className="w-full max-w-full">
          <p className={`font-medium transition-colors duration-200 truncate ${
            isMobile ? 'text-sm' : 'text-xs'
          } ${isDragOver ? 'text-blue-700' : 'text-slate-700'}`}>
            {isDragOver ? 'Drop files here' : (isMobile ? 'Tap to upload' : 'Drag files here')}
          </p>
          <p className="text-slate-500 text-xs mt-1 truncate">
            {isMobile ? 'Or use buttons below' : 'Or click to browse'}
          </p>
        </div>
        <div className={`flex gap-2 justify-center w-full max-w-full ${
          isMobile ? 'flex-col' : 'flex-row'
        }`}>
          <Button
            type="button"
            onClick={onBrowseFiles}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105 
              touch-manipulation active:scale-95 text-xs flex-shrink-0"
            aria-label="Browse files"
          >
            <FolderOpen size={12} />
            <span className="truncate">Browse Files</span>
          </Button>
          {isMobile && (
            <Button
              type="button"
              onClick={onCameraCapture}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 
                touch-manipulation active:scale-95 text-xs flex-shrink-0"
              aria-label="Take photo with camera"
            >
              <Camera size={12} />
              <span className="truncate">Take Photo</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

FileDropZone.displayName = 'FileDropZone';
