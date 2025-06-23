
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
    <div className="animate-fade-in bg-slate-50 rounded-lg border border-slate-200" 
         style={{ padding: isMobile ? '16px' : '24px' }}>
      <div className="space-y-4">
        <div>
          <h3 className={`font-semibold text-slate-800 flex items-center gap-2 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            <Sparkles className="text-blue-500" size={isMobile ? 18 : 20} />
            Smart Document Upload
          </h3>
          <p className={`text-slate-600 mt-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {isMobile 
              ? 'Select document type for smart processing'
              : 'Select a document type to enable intelligent categorization and processing'
            }
          </p>
        </div>

        {/* Upload Templates */}
        {uploadTemplates.length > 0 && (
          <div>
            <Label className="text-slate-700 font-medium">Quick Templates</Label>
            <Select value={uploadTemplate} onValueChange={onTemplateSelect} disabled={isUploading}>
              <SelectTrigger className={`mt-1 ${isMobile ? 'min-h-[48px]' : ''}`}>
                <SelectValue placeholder={
                  isMobile ? 'Choose template' : 'Choose a template for faster upload'
                } />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                {uploadTemplates.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Document Category Selection */}
        <div>
          <Label className="text-slate-700 font-medium">
            Document Type {!isMobile && projectPhase !== 'planning' && (
              <span className="text-xs text-blue-600">({projectPhase} phase)</span>
            )}
          </Label>
          <div className="mt-3">
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
          <div className={`text-blue-700 bg-blue-50 rounded-lg border border-blue-200 ${
            isMobile ? 'p-3 text-sm' : 'p-3 text-sm'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="font-medium">Smart Processing Enabled</span>
            </div>
            <p className="mt-1">
              {isMobile ? (
                `Files will be categorized as "${prioritizedCategories.find(c => c.value === preSelectedCategory)?.label}"`
              ) : (
                <>
                  All uploaded files will be categorized as "{prioritizedCategories.find(c => c.value === preSelectedCategory)?.label}".
                  {preSelectedCategory === 'receipts' && " Expense tracking fields will be automatically added."}
                  {preSelectedCategory === 'photos' && " Location and timestamp metadata will be captured."}
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
