
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
        border-2 border-dashed rounded-lg text-center transition-all duration-300 ease-in-out
        touch-manipulation
        ${isMobile ? 'p-6 min-h-[200px]' : 'p-4 sm:p-8'}
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg ring-2 ring-blue-200' 
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
      <div className={`space-y-4 ${isMobile ? 'space-y-4' : 'space-y-3 sm:space-y-4'}`}>
        <div className={`mx-auto bg-slate-100 rounded-full flex items-center justify-center transition-all duration-300 ${
          isMobile ? 'w-16 h-16' : 'w-12 h-12 sm:w-16 sm:h-16'
        } ${isDragOver ? 'bg-blue-100 scale-110' : 'hover:bg-slate-200'}`}>
          <Upload 
            size={isMobile ? 32 : 24} 
            className={`transition-all duration-300 ${
              isDragOver ? 'text-blue-500 scale-110' : 'text-slate-400'
            }`} 
          />
        </div>
        <div>
          <p className={`font-medium transition-colors duration-200 ${
            isMobile ? 'text-lg' : 'text-base sm:text-lg'
          } ${isDragOver ? 'text-blue-700' : 'text-slate-700'}`}>
            {isDragOver ? 'Drop files here' : (isMobile ? 'Tap to upload files' : 'Drag files here to upload')}
          </p>
          <p className={`text-slate-500 ${isMobile ? 'text-sm mt-2' : 'text-xs sm:text-sm'}`}>
            {isMobile ? 'Or use buttons below' : 'Or click to browse files'}
          </p>
        </div>
        <div className={`flex gap-3 justify-center ${
          isMobile ? 'flex-col' : 'flex-col sm:flex-row'
        }`}>
          <Button
            type="button"
            onClick={onBrowseFiles}
            variant="outline"
            className={`flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md 
              ${isMobile ? 'min-h-[48px] text-base' : 'min-h-[44px] text-sm'} 
              touch-manipulation active:scale-95`}
            aria-label="Browse files"
          >
            <FolderOpen size={isMobile ? 20 : 16} />
            {isMobile ? 'Browse Files' : 'Browse Files'}
          </Button>
          {isMobile && (
            <Button
              type="button"
              onClick={onCameraCapture}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md 
                min-h-[48px] text-base touch-manipulation active:scale-95"
              aria-label="Take photo with camera"
            >
              <Camera size={20} />
              Take Photo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

FileDropZone.displayName = 'FileDropZone';
