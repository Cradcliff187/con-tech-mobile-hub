import { useState, useRef, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertCircle, Sparkles, FileText, Camera, Receipt, Shield, Building, ClipboardList } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { analyzeFile, validateFileSize, type ProjectPhaseContext } from '@/utils/smartFileAnalysis';
import { type SmartFileData } from './FilePreviewCard';
import { CategorySelectionPanel } from './CategorySelectionPanel';
import { FileProcessingArea } from './FileProcessingArea';
import { ProjectSelectionField } from './ProjectSelectionField';
import { UploadProgress } from './UploadProgress';
import { toast } from 'sonner';

interface SmartDocumentUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
  variant?: 'dialog' | 'inline';
  className?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DOCUMENT_CATEGORIES = [
  { value: 'plans', label: 'Plans & Drawings', icon: FileText, description: 'Blueprints, CAD files, architectural drawings' },
  { value: 'photos', label: 'Progress Photos', icon: Camera, description: 'Site photos, before/after images, progress documentation' },
  { value: 'receipts', label: 'Receipts & Expenses', icon: Receipt, description: 'Purchase receipts, invoices, expense documentation' },
  { value: 'permits', label: 'Permits & Approvals', icon: Shield, description: 'Building permits, inspections, regulatory approvals' },
  { value: 'contracts', label: 'Contracts & Agreements', icon: Building, description: 'Contracts, proposals, legal documents' },
  { value: 'reports', label: 'Reports & Documentation', icon: ClipboardList, description: 'Status reports, inspection reports, documentation' },
  { value: 'safety', label: 'Safety Documents', icon: Shield, description: 'Safety protocols, MSDS sheets, incident reports' },
  { value: 'other', label: 'Other Documents', icon: FileText, description: 'Miscellaneous project documents' }
];

const PHASE_PRIORITY_CATEGORIES = {
  planning: ['plans', 'permits', 'contracts'],
  active: ['photos', 'receipts', 'reports', 'safety'],
  punch_list: ['photos', 'reports'],
  closeout: ['reports', 'photos', 'other'],
  completed: ['other', 'reports']
};

export const SmartDocumentUpload = ({
  projectId,
  onUploadComplete,
  variant = 'dialog',
  className,
  isOpen,
  onOpenChange
}: SmartDocumentUploadProps) => {
  const [searchParams] = useSearchParams();
  const currentProjectId = projectId || searchParams.get('project') || '';
  
  const [selectedFiles, setSelectedFiles] = useState<SmartFileData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId);
  const [activeTab, setActiveTab] = useState('drop');
  const [preSelectedCategory, setPreSelectedCategory] = useState<string>('');
  const [uploadTemplate, setUploadTemplate] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadDocument, canUpload } = useDocuments();
  const { projects } = useProjects();
  const { user, profile } = useAuth();
  const isMobile = useIsMobile();

  // Get current project and its phase
  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectPhase = currentProject?.phase || 'planning';

  // Get prioritized categories based on project phase
  const getPrioritizedCategories = useCallback(() => {
    const phaseCategories = PHASE_PRIORITY_CATEGORIES[projectPhase as keyof typeof PHASE_PRIORITY_CATEGORIES] || [];
    const prioritized = DOCUMENT_CATEGORIES.filter(cat => phaseCategories.includes(cat.value))
      .map(cat => ({ ...cat, isPriority: true }));
    const others = DOCUMENT_CATEGORIES.filter(cat => !phaseCategories.includes(cat.value));
    return [...prioritized, ...others];
  }, [projectPhase]);

  // Upload templates based on project phase
  const getUploadTemplates = useCallback(() => {
    const templates = [];
    
    switch (projectPhase) {
      case 'planning':
        templates.push(
          { value: 'plans-batch', label: 'Architectural Plans Package', category: 'plans' },
          { value: 'permits-batch', label: 'Permit Documentation', category: 'permits' }
        );
        break;
      case 'active':
        templates.push(
          { value: 'daily-photos', label: 'Daily Progress Photos', category: 'photos' },
          { value: 'expense-receipts', label: 'Expense Receipts', category: 'receipts' },
          { value: 'safety-checklist', label: 'Safety Documentation', category: 'safety' }
        );
        break;
      case 'punch_list':
        templates.push(
          { value: 'punch-photos', label: 'Punch List Items', category: 'photos' },
          { value: 'completion-docs', label: 'Completion Documentation', category: 'reports' }
        );
        break;
    }
    
    return templates;
  }, [projectPhase]);

  const uploadTemplates = getUploadTemplates();
  const prioritizedCategories = getPrioritizedCategories();

  // Debug logging
  useEffect(() => {
    console.log('SmartDocumentUpload Debug:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { 
        is_company_user: profile.is_company_user, 
        account_status: profile.account_status,
        role: profile.role 
      } : null,
      canUploadResult: canUpload(),
      variant,
      projectId: currentProjectId,
      isOpen,
      projectPhase,
      preSelectedCategory
    });
  }, [user, profile, canUpload, variant, currentProjectId, isOpen, projectPhase, preSelectedCategory]);

  // Handle dialog state changes
  const handleOpenChange = (open: boolean) => {
    console.log('Dialog state changing:', { from: isOpen, to: open });
    if (onOpenChange) {
      onOpenChange(open);
    }
    if (!open) {
      resetForm();
    }
  };

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
        toast.error("File too large", {
          description: validation.error,
          duration: 4000,
        });
        continue;
      }
      
      const analysis = analyzeFile(file, projectContext);
      const preview = await createPreview(file);
      
      // Use pre-selected category if available, otherwise use AI analysis
      const finalCategory = preSelectedCategory || analysis.category;
      
      processedFiles.push({
        file,
        analysis: { ...analysis, category: finalCategory },
        preview,
        id: generateFileId(),
        category: finalCategory,
        description: file.name,
        expenseAmount: analysis.isReceipt ? '' : undefined,
        expenseVendor: analysis.isReceipt ? '' : undefined,
        expenseType: analysis.isReceipt ? 'materials' : undefined
      });
    }
    
    setSelectedFiles(prev => [...prev, ...processedFiles]);
    
    if (processedFiles.length > 0) {
      toast.success(`${processedFiles.length} file${processedFiles.length !== 1 ? 's' : ''} added`, {
        description: preSelectedCategory 
          ? `Files categorized as ${DOCUMENT_CATEGORIES.find(c => c.value === preSelectedCategory)?.label}`
          : 'Files analyzed and categorized automatically.',
        duration: 3000,
      });
    }
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
    toast.info('File removed', {
      description: 'The file has been removed from the upload queue.',
      duration: 2000,
    });
  };

  const updateFileData = (fileId: string, updates: Partial<SmartFileData>) => {
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected", {
        description: "Please select files to upload",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const results = { success: 0, failed: 0 };
      
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
          results.success++;
          
        } catch (error) {
          updateFileData(fileData.id, { 
            error: error instanceof Error ? error.message : 'Upload failed',
            uploadProgress: undefined
          });
          results.failed++;
        }
      }
      
      if (results.success > 0) {
        toast.success("Upload Complete", {
          description: `Successfully uploaded ${results.success} file${results.success !== 1 ? 's' : ''}${results.failed > 0 ? `, ${results.failed} failed` : ''}`,
          duration: 4000,
        });
      }

      if (results.failed > 0 && results.success === 0) {
        toast.error("Upload Failed", {
          description: `Failed to upload ${results.failed} file${results.failed !== 1 ? 's' : ''}`,
          duration: 4000,
        });
      }

      if (results.failed === 0) {
        resetForm();
        handleOpenChange(false);
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
    setPreSelectedCategory('');
    setUploadTemplate('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleTemplateSelect = (templateValue: string) => {
    const template = uploadTemplates.find(t => t.value === templateValue);
    if (template) {
      setPreSelectedCategory(template.category);
      setUploadTemplate(templateValue);
      toast.info("Template Applied", {
        description: `Files will be categorized as ${DOCUMENT_CATEGORIES.find(c => c.value === template.category)?.label}`,
        duration: 3000,
      });
    }
  };

  // Enhanced permission checking
  const checkCanUpload = () => {
    const hasUser = !!user;
    const hasProfile = !!profile;
    const isApproved = profile?.account_status === 'approved';

    return hasUser && hasProfile && isApproved;
  };

  // Show loading state if auth is still loading
  if (!user || !profile) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-slate-500">
          <Sparkles size={20} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show permission denied state with clear messaging
  if (!checkCanUpload()) {
    return (
      <div className={`flex items-center gap-3 text-slate-600 p-4 bg-slate-50 rounded-lg border border-slate-200 ${className}`}>
        <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium">Upload Restricted</p>
          <p className="text-slate-500 mt-1">
            {!profile?.is_company_user 
              ? "External users need approval to upload documents. Contact your project manager."
              : profile?.account_status !== 'approved'
              ? "Your account is pending approval. Contact an administrator."
              : "You don't have permission to upload documents."
            }
          </p>
        </div>
      </div>
    );
  }

  console.log('Rendering Smart Upload component with permissions granted');

  const DialogOrSheet = isMobile ? Sheet : Dialog;
  const DialogOrSheetContent = isMobile ? SheetContent : DialogContent;
  const DialogOrSheetHeader = isMobile ? SheetHeader : DialogHeader;
  const DialogOrSheetTitle = isMobile ? SheetTitle : DialogTitle;

  const uploadContent = (
    <div className="space-y-4 w-full max-w-full">
      {/* Category Selection Panel */}
      <CategorySelectionPanel
        uploadTemplates={uploadTemplates}
        uploadTemplate={uploadTemplate}
        onTemplateSelect={handleTemplateSelect}
        preSelectedCategory={preSelectedCategory}
        onCategorySelect={setPreSelectedCategory}
        prioritizedCategories={prioritizedCategories}
        projectPhase={projectPhase}
        isUploading={isUploading}
      />

      {/* File Processing Area */}
      <FileProcessingArea
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDragOver={isDragOver}
        selectedFiles={selectedFiles}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onBrowseFiles={handleBrowseFiles}
        onCameraCapture={handleCameraCapture}
        onRemoveFile={removeFile}
        onUpdateFileData={updateFileData}
        onClearAllFiles={() => setSelectedFiles([])}
        isUploading={isUploading}
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

      {/* Project Selection */}
      <ProjectSelectionField
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        projects={projects}
        isUploading={isUploading}
        currentProjectId={currentProjectId}
      />

      {/* Upload Actions */}
      <UploadProgress
        selectedFilesCount={selectedFiles.length}
        isUploading={isUploading}
        onUpload={handleUpload}
        onCancel={variant === 'dialog' ? () => handleOpenChange(false) : undefined}
        variant={variant}
      />
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:shadow-lg ${className}`}>
        {uploadContent}
      </div>
    );
  }

  return (
    <DialogOrSheet open={isOpen} onOpenChange={handleOpenChange}>
      <DialogOrSheetContent className={`${
        isMobile 
          ? "h-[95vh] w-full max-w-full overflow-hidden" 
          : "sm:max-w-xl max-h-[90vh] w-full overflow-hidden"
      } animate-scale-in`}>
        <DialogOrSheetHeader className="flex-shrink-0 pb-2">
          <DialogOrSheetTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="text-blue-500 flex-shrink-0" size={20} />
            <span className="truncate">Smart Document Upload</span>
          </DialogOrSheetTitle>
        </DialogOrSheetHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {uploadContent}
        </div>
      </DialogOrSheetContent>
    </DialogOrSheet>
  );
};
