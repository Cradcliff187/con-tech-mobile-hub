
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface UploadProgressProps {
  selectedFilesCount: number;
  isUploading: boolean;
  onUpload: () => void;
  onCancel?: () => void;
  variant?: 'dialog' | 'inline';
}

export const UploadProgress = ({
  selectedFilesCount,
  isUploading,
  onUpload,
  onCancel,
  variant = 'dialog'
}: UploadProgressProps) => {
  return (
    <div className="flex gap-3 pt-4 border-t">
      <Button
        onClick={onUpload}
        disabled={selectedFilesCount === 0 || isUploading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 min-h-[44px]"
      >
        {isUploading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Uploading...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload size={16} />
            Upload {selectedFilesCount > 0 ? `${selectedFilesCount} File${selectedFilesCount !== 1 ? 's' : ''}` : 'Files'}
          </div>
        )}
      </Button>
      {variant === 'dialog' && onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 min-h-[44px]"
          disabled={isUploading}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};
