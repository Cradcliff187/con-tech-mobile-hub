
import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { analyzeFile, validateFileSize, type ProjectPhaseContext } from '@/utils/smartFileAnalysis';
import { FileUploadTabs } from './FileUploadTabs';
import { FilePreviewCard, type SmartFileData } from './FilePreviewCard';
import { UploadProgress } from './UploadProgress';

interface SmartDocumentUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
  variant?: 'dialog' | 'inline';
  className?: string;
  triggerButton?: React.ReactNode;
}

export const SmartDocumentUpload = ({
  projectId,
  onUploadComplete,
  variant = 'dialog',
  className,
  triggerButton
}: SmartDocumentUploadProps) => {
  const [searchParams] = useSearchParams();
  const currentProjectId = projectId || searchParams.get('project') || '';
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<SmartFileData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId);
  const [activeTab, setActiveTab] = useState('drop');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadDocument } = useDocuments();
  const { projects } = useProjects();
  const { profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const getProjectContext = useCallback((): ProjectPhaseContext | undefined => {
    if (!selectedProjectId) return undefined;
    
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return undefined;
    
    return {
      phase: project.phase || 'planning',
      status: project.status || 'planning'
    };
  }, [selectedProjectId, projects]);

  const generateFileId = () => Math.random().toString(36).substr(2, 9);

  const createPreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const projectContext = getProjectContext();
    
    const processedFiles: SmartFileData[] = [];
    
    for (const file of fileArray) {
      const validation = validateFileSize(file);
      if (!validation.isValid) {
        toast({
          title: "File too large",
          description: validation.error,
          variant: "destructive"
        });
        continue;
      }
      
      const analysis = analyzeFile(file, projectContext);
      const preview = await createPreview(file);
      
      processedFiles.push({
        file,
        analysis,
        preview,
        id: generateFileId(),
        category: analysis.category,
        description: file.name,
        expenseAmount: analysis.isReceipt ? '' : undefined,
        expenseVendor: analysis.isReceipt ? '' : undefined,
        expenseType: analysis.isReceipt ? 'materials' : undefined
      });
    }
    
    setSelectedFiles(prev => [...prev, ...processedFiles]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleBrowseFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileData = (fileId: string, updates: Partial<SmartFileData>) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      for (const fileData of selectedFiles) {
        try {
          updateFileData(fileData.id, { uploadProgress: 0 });
          
          const description = fileData.analysis.isReceipt 
            ? `Receipt - ${fileData.expenseVendor || 'Unknown Vendor'} - $${fileData.expenseAmount || '0'}`
            : fileData.description;

          await uploadDocument(
            fileData.file,
            fileData.category,
            selectedProjectId,
            description
          );

          updateFileData(fileData.id, { uploadProgress: 100 });
          
        } catch (error) {
          updateFileData(fileData.id, { 
            error: error instanceof Error ? error.message : 'Upload failed',
            uploadProgress: undefined
          });
        }
      }

      const successCount = selectedFiles.filter(f => !f.error).length;
      const errorCount = selectedFiles.filter(f => f.error).length;

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}${errorCount > 0 ? `, ${errorCount} failed` : ''}`
        });
      }

      if (errorCount === 0) {
        resetForm();
        setIsOpen(false);
        onUploadComplete?.();
      }
      
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setSelectedProjectId(currentProjectId);
    setActiveTab('drop');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const canUpload = profile && (
    (profile.is_company_user && profile.account_status === 'approved') ||
    (!profile.is_company_user && profile.account_status === 'approved')
  );

  if (!canUpload) {
    return null;
  }

  const DialogOrSheet = isMobile ? Sheet : Dialog;
  const DialogOrSheetContent = isMobile ? SheetContent : DialogContent;
  const DialogOrSheetHeader = isMobile ? SheetHeader : DialogHeader;
  const DialogOrSheetTitle = isMobile ? SheetTitle : DialogTitle;
  const DialogOrSheetTrigger = isMobile ? SheetTrigger : DialogTrigger;

  const uploadContent = (
    <div className="space-y-6">
      <FileUploadTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDragOver={isDragOver}
        selectedFilesCount={selectedFiles.length}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onBrowseFiles={handleBrowseFiles}
        onCameraCapture={handleCameraCapture}
      />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              Selected Files ({selectedFiles.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFiles([])}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {selectedFiles.map((fileData) => (
              <FilePreviewCard
                key={fileData.id}
                fileData={fileData}
                onRemove={removeFile}
                onUpdate={updateFileData}
                isUploading={isUploading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Project Selection */}
      {!currentProjectId && (
        <div>
          <Label className="text-slate-700 font-medium">Project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isUploading}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Actions */}
      <UploadProgress
        selectedFilesCount={selectedFiles.length}
        isUploading={isUploading}
        onUpload={handleUpload}
        onCancel={variant === 'dialog' ? () => setIsOpen(false) : undefined}
        variant={variant}
      />
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Sparkles className="text-blue-500" size={24} />
          Smart Document Upload
        </h3>
        {uploadContent}
      </div>
    );
  }

  return (
    <DialogOrSheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogOrSheetTrigger asChild>
        {triggerButton || (
          <Button className={`bg-blue-600 hover:bg-blue-700 min-h-[44px] ${className}`}>
            <Sparkles size={20} className="mr-2" />
            Smart Upload
          </Button>
        )}
      </DialogOrSheetTrigger>
      <DialogOrSheetContent className={isMobile ? "h-[90vh]" : "sm:max-w-4xl max-h-[90vh]"}>
        <DialogOrSheetHeader>
          <DialogOrSheetTitle className="flex items-center gap-2">
            <Sparkles className="text-blue-500" size={24} />
            Smart Document Upload
          </DialogOrSheetTitle>
        </DialogOrSheetHeader>
        <div className="flex-1 overflow-y-auto">
          {uploadContent}
        </div>
      </DialogOrSheetContent>
    </DialogOrSheet>
  );
};
