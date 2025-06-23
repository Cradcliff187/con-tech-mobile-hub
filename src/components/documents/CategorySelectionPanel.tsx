
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelector } from './CategorySelector';
import { Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface UploadTemplate {
  value: string;
  label: string;
  category: string;
}

interface CategorySelectionPanelProps {
  uploadTemplates: UploadTemplate[];
  uploadTemplate: string;
  onTemplateSelect: (template: string) => void;
  preSelectedCategory: string;
  onCategorySelect: (category: string) => void;
  prioritizedCategories: any[];
  projectPhase: string;
  isUploading: boolean;
}

export const CategorySelectionPanel: React.FC<CategorySelectionPanelProps> = ({
  uploadTemplates,
  uploadTemplate,
  onTemplateSelect,
  preSelectedCategory,
  onCategorySelect,
  prioritizedCategories,
  projectPhase,
  isUploading
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <Sparkles className="text-blue-500 flex-shrink-0" size={16} />
            Smart Document Upload
          </h3>
          <p className="text-slate-600 mt-1 text-xs">
            {isMobile 
              ? 'Select document type for processing'
              : 'Select a document type for intelligent categorization'
            }
          </p>
        </div>

        {/* Upload Templates */}
        {uploadTemplates.length > 0 && (
          <div>
            <Label className="text-slate-700 font-medium text-xs">Quick Templates</Label>
            <Select value={uploadTemplate} onValueChange={onTemplateSelect} disabled={isUploading}>
              <SelectTrigger className="mt-1 h-9">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                {uploadTemplates.map((template) => (
                  <SelectItem key={template.value} value={template.value} className="text-sm">
                    <span className="truncate">{template.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Document Category Selection */}
        <div>
          <Label className="text-slate-700 font-medium text-xs">
            Document Type
            {!isMobile && projectPhase !== 'planning' && (
              <span className="text-xs text-blue-600 ml-1">({projectPhase})</span>
            )}
          </Label>
          <div className="mt-2">
            <CategorySelector
              categories={prioritizedCategories}
              selectedCategory={preSelectedCategory}
              onCategorySelect={onCategorySelect}
              projectPhase={projectPhase}
              disabled={isUploading}
            />
          </div>
        </div>

        {preSelectedCategory && (
          <div className="text-blue-700 bg-blue-50 rounded-lg border border-blue-200 p-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="flex-shrink-0" />
              <span className="font-medium text-xs">Smart Processing Enabled</span>
            </div>
            <p className="mt-1 text-xs">
              Files will be categorized as "{prioritizedCategories.find(c => c.value === preSelectedCategory)?.label}".
              {!isMobile && preSelectedCategory === 'receipts' && " Expense fields will be added."}
              {!isMobile && preSelectedCategory === 'photos' && " Metadata will be captured."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
