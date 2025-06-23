
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Camera, FolderOpen } from 'lucide-react';
import { FileDropZone } from './FileDropZone';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileUploadTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDragOver: boolean;
  selectedFilesCount: number;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onBrowseFiles: () => void;
  onCameraCapture: () => void;
}

export const FileUploadTabs = ({
  activeTab,
  setActiveTab,
  isDragOver,
  selectedFilesCount,
  onDrop,
  onDragOver,
  onDragLeave,
  onBrowseFiles,
  onCameraCapture
}: FileUploadTabsProps) => {
  const isMobile = useIsMobile();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="drop" className="flex items-center gap-2 text-xs">
          <Upload size={14} />
          <span className="truncate">Drag & Drop</span>
        </TabsTrigger>
        <TabsTrigger value="browse" className="flex items-center gap-2 text-xs">
          <FolderOpen size={14} />
          <span className="truncate">Browse Files</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="drop" className="space-y-4 w-full max-w-full">
        <FileDropZone
          isDragOver={isDragOver}
          selectedFilesCount={selectedFilesCount}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onBrowseFiles={onBrowseFiles}
          onCameraCapture={onCameraCapture}
        />
      </TabsContent>
      
      <TabsContent value="browse" className="space-y-4 w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-full">
          <Button
            type="button"
            onClick={onBrowseFiles}
            className="h-20 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 w-full"
          >
            <FolderOpen size={24} />
            <span className="text-sm">Browse Files</span>
          </Button>
          {isMobile && (
            <Button
              type="button"
              onClick={onCameraCapture}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2 w-full"
            >
              <Camera size={24} />
              <span className="text-sm">Take Photo</span>
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
