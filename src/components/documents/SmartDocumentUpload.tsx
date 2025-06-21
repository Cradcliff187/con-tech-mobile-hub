
import { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Camera, 
  FileText, 
  Image, 
  Receipt, 
  X, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { analyzeFile, validateFileSize, type FileAnalysis, type ProjectPhaseContext } from '@/utils/smartFileAnalysis';
import { formatFileSize, getFileTypeInfo } from '@/utils/fileTypeHelpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface SmartFileData {
  file: File;
  analysis: FileAnalysis;
  preview?: string;
  id: string;
  uploadProgress?: number;
  error?: string;
  category: string;
  description: string;
  expenseAmount?: string;
  expenseVendor?: string;
  expenseType?: string;
}

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
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
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
    const fileTypeInfo = getFileTypeInfo(file.type, file.name);
    
    if (fileTypeInfo.category === 'image') {
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
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
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

  const getFileIcon = (analysis: FileAnalysis) => {
    if (analysis.isPhoto) return <Image size={20} className="text-blue-500" />;
    if (analysis.isReceipt) return <Receipt size={20} className="text-green-500" />;
    return <FileText size={20} className="text-slate-500" />;
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
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-slate-300 hover:border-slate-400'
              }
              ${selectedFiles.length > 0 ? 'border-green-500 bg-green-50' : ''}
            `}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Upload size={32} className={isDragOver ? 'text-blue-500' : 'text-slate-400'} />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">
                  {isDragOver ? 'Drop files here' : 'Drag files here to upload'}
                </p>
                <p className="text-sm text-slate-500">
                  Or click to browse files
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  onClick={handleBrowseFiles}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FolderOpen size={16} />
                  Browse Files
                </Button>
                {isMobile && (
                  <Button
                    type="button"
                    onClick={handleCameraCapture}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Camera size={16} />
                    Take Photo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              type="button"
              onClick={handleBrowseFiles}
              className="h-24 flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FolderOpen size={32} />
              <span>Browse Files</span>
            </Button>
            {isMobile && (
              <Button
                type="button"
                onClick={handleCameraCapture}
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
              <div key={fileData.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {fileData.preview ? (
                    <img 
                      src={fileData.preview} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded border flex items-center justify-center">
                      {getFileIcon(fileData.analysis)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-800 truncate">
                        {fileData.file.name}
                      </p>
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <Sparkles size={10} />
                        {Math.round(fileData.analysis.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(fileData.file.size)}
                    </p>
                    
                    {fileData.uploadProgress !== undefined && (
                      <div className="mt-2">
                        <Progress value={fileData.uploadProgress} className="h-2" />
                      </div>
                    )}
                    
                    {fileData.error && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                        <AlertCircle size={12} />
                        {fileData.error}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileData.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select 
                      value={fileData.category}
                      onValueChange={(value) => updateFileData(fileData.id, { category: value })}
                      disabled={isUploading}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fileData.analysis.suggestedCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center justify-between w-full">
                              {cat.label}
                              {cat.confidence > 0.7 && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Suggested
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="plans">Plans & Drawings</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="contracts">Contracts</SelectItem>
                        <SelectItem value="photos">Photos</SelectItem>
                        <SelectItem value="reports">Reports</SelectItem>
                        <SelectItem value="safety">Safety Documents</SelectItem>
                        <SelectItem value="receipts">Receipts</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Input
                      value={fileData.description}
                      onChange={(e) => updateFileData(fileData.id, { description: e.target.value })}
                      placeholder="Document description"
                      disabled={isUploading}
                      className="h-9"
                    />
                  </div>
                </div>
                
                {fileData.analysis.requiresExpenseFields && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <Label className="text-sm font-medium">Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={fileData.expenseAmount || ''}
                        onChange={(e) => updateFileData(fileData.id, { expenseAmount: e.target.value })}
                        placeholder="0.00"
                        disabled={isUploading}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Vendor</Label>
                      <Input
                        value={fileData.expenseVendor || ''}
                        onChange={(e) => updateFileData(fileData.id, { expenseVendor: e.target.value })}
                        placeholder="Vendor name"
                        disabled={isUploading}
                        className="h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
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
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
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
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}` : 'Files'}
            </div>
          )}
        </Button>
        {variant === 'dialog' && (
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1 min-h-[44px]"
            disabled={isUploading}
          >
            Cancel
          </Button>
        )}
      </div>
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
