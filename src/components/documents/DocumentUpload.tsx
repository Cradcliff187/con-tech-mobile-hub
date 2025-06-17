
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
  variant?: 'dialog' | 'inline';
  className?: string;
}

export const DocumentUpload = ({ 
  projectId, 
  onUploadComplete, 
  variant = 'dialog',
  className 
}: DocumentUploadProps) => {
  const [searchParams] = useSearchParams();
  const currentProjectId = projectId || searchParams.get('project') || '';
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId);
  const [description, setDescription] = useState('');
  const [fileValidation, setFileValidation] = useState<{ isValid: boolean; message?: string } | null>(null);
  
  const { uploadDocument, uploading } = useDocuments();
  const { projects, loading: projectsLoading } = useProjects();
  const { profile } = useAuth();
  const { toast } = useToast();

  const categories = [
    { value: 'plans', label: 'Plans & Drawings' },
    { value: 'permits', label: 'Permits' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'photos', label: 'Photos' },
    { value: 'reports', label: 'Reports' },
    { value: 'safety', label: 'Safety Documents' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'other', label: 'Other' }
  ];

  const validatedProjects = validateSelectData(projects);

  const validateFile = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'text/plain'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'File type not supported. Allowed: PDF, Word, Excel, images (PNG, JPG, GIF), and text files'
      };
    }

    return {
      isValid: true,
      message: `File looks good! Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      setFileValidation(validation);
      setSelectedFile(file);
      
      if (!description) {
        setDescription(file.name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !category) {
      toast({
        title: "Missing Information",
        description: "Please select a file and category",
        variant: "destructive"
      });
      return;
    }

    if (fileValidation && !fileValidation.isValid) {
      toast({
        title: "Invalid File",
        description: fileValidation.message,
        variant: "destructive"
      });
      return;
    }

    if (!profile?.is_company_user && !selectedProjectId) {
      toast({
        title: "Project Required",
        description: "Please select a project for this document",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadDocument(selectedFile, category, selectedProjectId, description);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFile.name} has been uploaded successfully`
      });
      
      resetForm();
      setIsOpen(false);
      onUploadComplete?.();
      
      // Update URL with document context if we have a project
      if (selectedProjectId && category) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('section', 'documents');
        newParams.set('project', selectedProjectId);
        newParams.set('category', category);
        window.history.replaceState({}, '', `/?${newParams.toString()}`);
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
        variant: "destructive"
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCategory('');
    setDescription('');
    setFileValidation(null);
  };

  const canUpload = profile && (
    (profile.is_company_user && profile.account_status === 'approved') ||
    (!profile.is_company_user && profile.account_status === 'approved')
  );

  if (!canUpload) {
    return null;
  }

  const uploadContent = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file" className="text-slate-700 font-medium">Select File</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
          disabled={uploading}
          className="mt-1 border-slate-200 focus:border-blue-500"
        />
        {selectedFile && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-slate-500 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
                {fileValidation && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    fileValidation.isValid ? 'text-green-600' : 'text-orange-500'
                  }`}>
                    {fileValidation.isValid ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    <span>{fileValidation.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-700 font-medium">Document Name</Label>
        <Input
          id="description"
          placeholder="Enter document name..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
          className="mt-1 border-slate-200 focus:border-blue-500"
        />
      </div>

      <div>
        <Label className="text-slate-700 font-medium">Category</Label>
        <Select value={category} onValueChange={setCategory} disabled={uploading}>
          <SelectTrigger className="mt-1 border-slate-200 focus:border-blue-500">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!currentProjectId && (
        <div>
          <Label className="text-slate-700 font-medium">Project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={uploading}>
            <SelectTrigger className="mt-1 border-slate-200 focus:border-blue-500">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projectsLoading ? (
                <SelectItem value="loading" disabled>Loading projects...</SelectItem>
              ) : validatedProjects.length === 0 ? (
                <SelectItem value="no-projects" disabled>No projects available</SelectItem>
              ) : (
                validatedProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || !category || uploading || (fileValidation && !fileValidation.isValid)}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Uploading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload size={16} />
              Upload Document
            </div>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(false)}
          className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
          disabled={uploading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Document</h3>
        {uploadContent}
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className={`bg-blue-600 hover:bg-blue-700 ${className}`}>
          <Upload size={20} />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">Upload Document</DialogTitle>
        </DialogHeader>
        {uploadContent}
      </DialogContent>
    </Dialog>
  );
};
