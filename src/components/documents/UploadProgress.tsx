
import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Upload, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UploadProgressProps {
  selectedFilesCount: number;
  isUploading: boolean;
  onUpload: () => void;
  onCancel?: () => void;
  variant?: 'dialog' | 'inline';
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  selectedFilesCount,
  isUploading,
  onUpload,
  onCancel,
  variant = 'dialog'
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-3">
      {selectedFilesCount > 0 && (
        <div className="text-center text-sm text-slate-600">
          {selectedFilesCount} file{selectedFilesCount !== 1 ? 's' : ''} ready to upload
        </div>
      )}
      
      <div className={`flex gap-3 ${
        isMobile ? 'flex-col-reverse' : variant === 'dialog' ? 'justify-end' : 'justify-center'
      }`}>
        {variant === 'dialog' && onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className={`transition-all duration-200 touch-manipulation ${
              isMobile ? 'min-h-[48px]' : 'min-h-[44px]'
            }`}
          >
            <X size={isMobile ? 18 : 16} className="mr-2" />
            Cancel
          </Button>
        )}
        
        <Button
          onClick={onUpload}
          disabled={isUploading || selectedFilesCount === 0}
          className={`bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105 
            touch-manipulation active:scale-95 ${
            isMobile ? 'min-h-[48px]' : 'min-h-[44px]'
          } ${variant === 'inline' ? 'flex-1' : ''}`}
        >
          {isUploading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              {isMobile ? 'Uploading...' : 'Uploading Documents...'}
            </>
          ) : (
            <>
              <Upload size={isMobile ? 18 : 16} className="mr-2" />
              {selectedFilesCount === 0 
                ? (isMobile ? 'Select Files' : 'Select Files to Upload')
                : `Upload ${selectedFilesCount} Document${selectedFilesCount !== 1 ? 's' : ''}`
              }
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
