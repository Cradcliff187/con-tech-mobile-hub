
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

interface DocumentUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
}

export const DocumentUpload = ({ projectId, onUploadComplete }: DocumentUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  
  const { uploadDocument, uploading } = useDocuments();
  const { projects, loading: projectsLoading } = useProjects();
  const { toast } = useToast();

  const categories = [
    { value: 'plans', label: 'Plans & Drawings' },
    { value: 'permits', label: 'Permits' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'photos', label: 'Photos' },
    { value: 'reports', label: 'Reports' },
    { value: 'safety', label: 'Safety Documents' },
    { value: 'other', label: 'Other' }
  ];

  const validatedProjects = validateSelectData(projects);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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

    const { error } = await uploadDocument(selectedFile, category, selectedProjectId);
    
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || 'Failed to upload document';
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
      setSelectedFile(null);
      setCategory('');
      setIsOpen(false);
      onUploadComplete?.();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-600 hover:bg-slate-700">
          <Upload size={20} />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xls,.xlsx"
            />
            {selectedFile && (
              <div className="mt-2 p-2 bg-slate-50 rounded-lg flex items-center gap-2">
                <FileText size={16} className="text-slate-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
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

          {!projectId && (
            <div>
              <Label>Project</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger>
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

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !category || uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
