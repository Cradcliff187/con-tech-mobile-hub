
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="drop" className="flex items-center gap-2">
          <Upload size={16} />
          Drag & Drop
        </TabsTrigger>
        <TabsTrigger value="browse" className="flex items-center gap-2">
          <FolderOpen size={16} />
          Browse Files
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="drop" className="space-y-4">
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
      
      <TabsContent value="browse" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            type="button"
            onClick={onBrowseFiles}
            className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FolderOpen size={32} />
            <span>Browse Files</span>
          </Button>
          {isMobile && (
            <Button
              type="button"
              onClick={onCameraCapture}
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <Camera size={32} />
              <span>Take Photo</span>
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};
