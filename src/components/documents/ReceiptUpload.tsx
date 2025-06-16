
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Receipt, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

interface ReceiptUploadProps {
  projectId?: string;
  onUploadComplete?: () => void;
}

export const ReceiptUpload = ({ projectId, onUploadComplete }: ReceiptUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [fileValidation, setFileValidation] = useState<{ isValid: boolean; message?: string } | null>(null);
  
  const { uploadDocument, uploading } = useDocuments();
  const { projects } = useProjects();
  const { toast } = useToast();

  const expenseTypes = [
    { value: 'materials', label: 'Materials' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'permits', label: 'Permits & Fees' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'other', label: 'Other' }
  ];

  const validateReceipt = (file: File) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
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
        message: 'Invalid receipt format. Please select a PDF, image (PNG, JPG, GIF), or text file'
      };
    }

    return {
      isValid: true,
      message: `Receipt looks good! Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateReceipt(file);
      setFileValidation(validation);
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !expenseType) {
      toast({
        title: "Missing Information",
        description: "Please select a receipt file and expense type",
        variant: "destructive"
      });
      return;
    }

    if (fileValidation && !fileValidation.isValid) {
      toast({
        title: "Invalid Receipt",
        description: fileValidation.message,
        variant: "destructive"
      });
      return;
    }

    // Create receipt description with metadata
    const receiptDescription = `Receipt - ${vendor || 'Unknown Vendor'} - ${expenseTypes.find(t => t.value === expenseType)?.label || expenseType} - $${amount || '0'}`;

    const { error } = await uploadDocument(
      selectedFile, 
      'receipts', 
      selectedProjectId,
      receiptDescription
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
        description: "Receipt uploaded successfully"
      });
      setSelectedFile(null);
      setAmount('');
      setVendor('');
      setExpenseType('');
      setFileValidation(null);
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
    setSelectedFile(null);
    setAmount('');
    setVendor('');
    setExpenseType('');
    setFileValidation(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Receipt size={20} />
          Upload Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Receipt</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="receipt-file">Receipt File</Label>
            <Input
              id="receipt-file"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
              disabled={uploading}
            />
            {selectedFile && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg">
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
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={uploading}
              />
            </div>
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                placeholder="Vendor name"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                disabled={uploading}
              />
            </div>
          </div>

          <div>
            <Label>Expense Type</Label>
            <Select value={expenseType} onValueChange={setExpenseType} disabled={uploading}>
              <SelectTrigger>
                <SelectValue placeholder="Select expense type" />
              </SelectTrigger>
              <SelectContent>
                {expenseTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={!selectedFile || !expenseType || uploading || (fileValidation && !fileValidation.isValid)}
              className="flex-1"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </div>
              ) : (
                'Upload Receipt'
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
      </DialogContent>
    </Dialog>
  );
};
