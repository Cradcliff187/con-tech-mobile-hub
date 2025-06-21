
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  AlertCircle,
  Sparkles,
  Image,
  Receipt,
  FileText
} from 'lucide-react';
import { formatFileSize } from '@/utils/fileTypeHelpers';
import { FileAnalysis } from '@/utils/smartFileAnalysis';

export interface SmartFileData {
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

interface FilePreviewCardProps {
  fileData: SmartFileData;
  onRemove: (fileId: string) => void;
  onUpdate: (fileId: string, updates: Partial<SmartFileData>) => void;
  isUploading: boolean;
}

export const FilePreviewCard = ({
  fileData,
  onRemove,
  onUpdate,
  isUploading
}: FilePreviewCardProps) => {
  const getFileIcon = (analysis: FileAnalysis) => {
    if (analysis.isPhoto) return <Image size={20} className="text-blue-500" />;
    if (analysis.isReceipt) return <Receipt size={20} className="text-green-500" />;
    return <FileText size={20} className="text-slate-500" />;
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 space-y-3">
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
          onClick={() => onRemove(fileData.id)}
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
            onValueChange={(value) => onUpdate(fileData.id, { category: value })}
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
            onChange={(e) => onUpdate(fileData.id, { description: e.target.value })}
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
              onChange={(e) => onUpdate(fileData.id, { expenseAmount: e.target.value })}
              placeholder="0.00"
              disabled={isUploading}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Vendor</Label>
            <Input
              value={fileData.expenseVendor || ''}
              onChange={(e) => onUpdate(fileData.id, { expenseVendor: e.target.value })}
              placeholder="Vendor name"
              disabled={isUploading}
              className="h-9"
            />
          </div>
        </div>
      )}
    </div>
  );
};
