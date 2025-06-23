
import React from 'react';
import { X, FileText, Image, Receipt, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useIsMobile } from '@/hooks/use-mobile';

export interface SmartFileData {
  id: string;
  file: File;
  preview?: string;
  category: string;
  description: string;
  analysis: {
    category: string;
    confidence: number;
    isReceipt: boolean;
    isPhoto: boolean;
  };
  expenseAmount?: string;
  expenseVendor?: string;
  expenseType?: 'materials' | 'labor' | 'equipment' | 'other';
  uploadProgress?: number;
  error?: string;
}

interface FilePreviewCardProps {
  fileData: SmartFileData;
  onRemove: (fileId: string) => void;
  onUpdate: (fileId: string, updates: Partial<SmartFileData>) => void;
  isUploading: boolean;
}

const DOCUMENT_CATEGORIES = [
  { value: 'plans', label: 'Plans & Drawings' },
  { value: 'photos', label: 'Progress Photos' },
  { value: 'receipts', label: 'Receipts & Expenses' },
  { value: 'permits', label: 'Permits & Approvals' },
  { value: 'contracts', label: 'Contracts & Agreements' },
  { value: 'reports', label: 'Reports & Documentation' },
  { value: 'safety', label: 'Safety Documents' },
  { value: 'other', label: 'Other Documents' }
];

export const FilePreviewCard: React.FC<FilePreviewCardProps> = ({
  fileData,
  onRemove,
  onUpdate,
  isUploading
}) => {
  const isMobile = useIsMobile();
  const { file, preview, category, description, analysis, uploadProgress, error } = fileData;

  const getFileIcon = () => {
    if (analysis.isPhoto) return <Image size={isMobile ? 20 : 16} className="text-blue-500" />;
    if (analysis.isReceipt) return <Receipt size={isMobile ? 20 : 16} className="text-green-500" />;
    return <FileText size={isMobile ? 20 : 16} className="text-slate-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-lg transition-all duration-200 hover:shadow-md
      ${isMobile ? 'p-4' : 'p-3'}`}>
      {/* File Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {preview ? (
            <img 
              src={preview} 
              alt="Preview" 
              className={`object-cover rounded ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}
            />
          ) : (
            <div className={`bg-slate-100 rounded flex items-center justify-center flex-shrink-0
              ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}`}>
              {getFileIcon()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-medium text-slate-800 truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                {file.name}
              </p>
              {analysis.confidence > 0.7 && (
                <Badge variant="secondary" className="text-xs">
                  AI: {Math.round(analysis.confidence * 100)}%
                </Badge>
              )}
            </div>
            <p className={`text-slate-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(fileData.id)}
          disabled={isUploading}
          className={`text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0
            ${isMobile ? 'p-2' : 'p-1'} touch-manipulation`}
        >
          <X size={isMobile ? 18 : 16} />
        </Button>
      </div>

      {/* Category Selection */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div>
          <Label className={`text-slate-700 font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
            Category
          </Label>
          <Select 
            value={category} 
            onValueChange={(value) => onUpdate(fileData.id, { category: value })}
            disabled={isUploading}
          >
            <SelectTrigger className={`mt-1 ${isMobile ? 'min-h-[44px]' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white">
              {DOCUMENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className={`text-slate-700 font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
            Description
          </Label>
          <Input
            value={description}
            onChange={(e) => onUpdate(fileData.id, { description: e.target.value })}
            placeholder="File description"
            disabled={isUploading}
            className={`mt-1 ${isMobile ? 'min-h-[44px]' : ''}`}
          />
        </div>
      </div>

      {/* Expense Fields for Receipts */}
      {analysis.isReceipt && (
        <div className={`mt-3 p-3 bg-green-50 rounded-lg border border-green-200`}>
          <p className={`text-green-700 font-medium mb-2 ${isMobile ? 'text-sm' : 'text-xs'}`}>
            Expense Information
          </p>
          <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <Input
              placeholder="Vendor name"
              value={fileData.expenseVendor || ''}
              onChange={(e) => onUpdate(fileData.id, { expenseVendor: e.target.value })}
              disabled={isUploading}
              className={isMobile ? 'min-h-[44px]' : ''}
            />
            <Input
              placeholder="Amount"
              type="number"
              step="0.01"
              value={fileData.expenseAmount || ''}
              onChange={(e) => onUpdate(fileData.id, { expenseAmount: e.target.value })}
              disabled={isUploading}
              className={isMobile ? 'min-h-[44px]' : ''}
            />
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-slate-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              Uploading...
            </span>
            <span className={`text-slate-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
              {uploadProgress}%
            </span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <AlertCircle size={16} />
          <span className={isMobile ? 'text-sm' : 'text-xs'}>{error}</span>
        </div>
      )}
    </div>
  );
};
