
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PhotoUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
}

export const PhotoUpload = ({ projectId, onUploadComplete }: PhotoUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [fileValidation, setFileValidation] = useState<{ isValid: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadDocument, uploading } = useDocuments();
  const { projects } = useProjects();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const photoTypes = [
    { value: 'progress', label: 'Progress Photos' },
    { value: 'before', label: 'Before Photos' },
    { value: 'after', label: 'After Photos' },
    { value: 'materials', label: 'Materials' },
    { value: 'issues', label: 'Issues/Problems' },
    { value: 'safety', label: 'Safety Documentation' },
    { value: 'inspection', label: 'Inspection Photos' },
    { value: 'other', label: 'Other' }
  ];

  const validatePhoto = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        message: `Photo size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        message: 'Invalid photo format. Please select a PNG, JPG, JPEG, or GIF image'
      };
    }

    return {
      isValid: true,
      message: `Photo looks good! Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validatePhoto(file);
      setFileValidation(validation);
      
      if (validation.isValid) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Invalid Photo",
          description: validation.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleGalleryUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileValidation(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || !photoType) {
      toast({
        title: "Missing Information",
        description: "Please take/select a photo and choose a photo type",
        variant: "destructive"
      });
      return;
    }

    if (fileValidation && !fileValidation.isValid) {
      toast({
        title: "Invalid Photo",
        description: fileValidation.message,
        variant: "destructive"
      });
      return;
    }

    const photoDescription = description || `${photoTypes.find(t => t.value === photoType)?.label} - ${new Date().toLocaleDateString()}`;

    const { error } = await uploadDocument(
      selectedFile, 
      'photos', 
      selectedProjectId,
      photoDescription
    );
    
    if (error) {
      toast({
        title: "Upload Failed",
        description: error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Photo uploaded successfully"
      });
      clearPhoto();
      setPhotoType('');
      setDescription('');
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

  const resetForm = () => {
    clearPhoto();
    setPhotoType('');
    setDescription('');
  };

  const DialogOrSheet = isMobile ? Sheet : Dialog;
  const DialogOrSheetContent = isMobile ? SheetContent : DialogContent;
  const DialogOrSheetHeader = isMobile ? SheetHeader : DialogHeader;
  const DialogOrSheetTitle = isMobile ? SheetTitle : DialogTitle;
  const DialogOrSheetTrigger = isMobile ? SheetTrigger : DialogTrigger;

  return (
    <DialogOrSheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogOrSheetTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Camera size={20} />
          Add Photo
        </Button>
      </DialogOrSheetTrigger>
      <DialogOrSheetContent className={isMobile ? "h-[90vh]" : "sm:max-w-md"}>
        <DialogOrSheetHeader>
          <DialogOrSheetTitle>Add Photo</DialogOrSheetTitle>
        </DialogOrSheetHeader>
        
        <div className="space-y-4 flex-1 overflow-y-auto">
          {!selectedFile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  onClick={handleCameraCapture}
                  className="h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center gap-2"
                  disabled={uploading}
                >
                  <Camera size={24} />
                  <span>Take Photo</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleGalleryUpload}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  disabled={uploading}
                >
                  <Upload size={24} />
                  <span>Upload from Gallery</span>
                </Button>
              </div>
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={clearPhoto}
                  disabled={uploading}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
                {fileValidation && (
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    fileValidation.isValid ? 'text-green-600' : 'text-red-600'
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

              <div>
                <Label>Photo Type</Label>
                <Select value={photoType} onValueChange={setPhotoType} disabled={uploading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select photo type" />
                  </SelectTrigger>
                  <SelectContent>
                    {photoTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Add a description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {!projectId && (
                <div>
                  <Label>Project</Label>
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={uploading}>
                    <SelectTrigger>
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

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !photoType || uploading || (fileValidation && !fileValidation.isValid)}
                  className="flex-1"
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload Photo'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogOrSheetContent>
    </DialogOrSheet>
  );
};
