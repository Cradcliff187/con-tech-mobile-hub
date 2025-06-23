
import React from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Upload, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UploadProgressProps {
  selectedFilesCount: number;
  isU

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

  if (selectedFilesCount === 0) {
    return null;
  }

  return (
    <div className={`flex gap-3 pt-4 border-t border-slate-200 ${
      isMobile ? 'flex-col' : variant === 'dialog' ? 'justify-end' : 'justify-center'
    }`}>
      {variant === 'dialog' && onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
          className={`transition-all duration-200 touch-manipulation ${
            isMobile ? 'min-h-[48px] order-2' : 'min-h-[44px]'
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
          isMobile ? 'min-h-[48px] order-1' : 'min-h-[44px]'
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
            {isMobile 
              ? `Upload ${selectedFilesCount} File${selectedFilesCount !== 1 ? 's' : ''}`
              : `Upload ${selectedFilesCount} Document${selectedFilesCount !== 1 ? 's' : ''}`
            }
          </>
        )}
      </Button>
    </div>
  );
};
