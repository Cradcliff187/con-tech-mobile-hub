
import React from 'react';
import { FileUploadTabs } from './FileUploadTabs';
import { FilePreviewCard, type SmartFileData } from './FilePreviewCard';
import { Button } from '@/components/ui/button';

interface FileProcessingAreaProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDragOver: boolean;
  selectedFiles: SmartFileData[];
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onBrowseFiles: () => void;
  onCameraCapture: () => void;
  onRemoveFile: (fileId: string) => void;
  onUpdateFileData: (fileId: string, updates: Partial<SmartFileData>) => void;
  onClearAllFiles: () => void;
  isUploading: boolean;
}

export const FileProcessingArea: React.FC<FileProcessingAreaProps> = ({
  activeTab,
  setActiveTab,
  isDragOver,
  selectedFiles,
  onDrop,
  onDragOver,
  onDragLeave,
  onBrowseFiles,
  onCameraCapture,
  onRemoveFile,
  onUpdateFileData,
  onClearAllFiles,
  isUploading
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* File Upload Interface */}
      <div className="animate-fade-in w-full">
        <FileUploadTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDragOver={isDragOver}
          selectedFilesCount={selectedFiles.length}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onBrowseFiles={onBrowseFiles}
          onCameraCapture={onCameraCapture}
        />
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4 animate-fade-in w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              Selected Files ({selectedFiles.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAllFiles}
              className="text-red-600 hover:text-red-700 transition-colors duration-200 hover:scale-105 flex-shrink-0"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-48 overflow-y-auto w-full border border-slate-200 rounded-lg p-3 bg-slate-50">
            {selectedFiles.map((fileData, index) => (
              <div 
                key={fileData.id}
                className="animate-stagger-fade-in w-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FilePreviewCard
                  fileData={fileData}
                  onRemove={onRemoveFile}
                  onUpdate={onUpdateFileData}
                  isUploading={isUploading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
