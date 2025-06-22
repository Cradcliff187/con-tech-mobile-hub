
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelector } from './CategorySelector';
import { Sparkles } from 'lucide-react';

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
  return (
    <div className="animate-fade-in bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-blue-500" size={20} />
            Smart Document Upload
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Select a document type to enable intelligent categorization and processing
          </p>
        </div>

        {/* Upload Templates */}
        {uploadTemplates.length > 0 && (
          <div>
            <Label className="text-slate-700 font-medium">Quick Templates</Label>
            <Select value={uploadTemplate} onValueChange={onTemplateSelect} disabled={isUploading}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a template for faster upload" />
              </SelectTrigger>
              <SelectContent>
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
            Document Type {projectPhase !== 'planning' && <span className="text-xs text-blue-600">({projectPhase} phase)</span>}
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
          <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="font-medium">Smart Processing Enabled</span>
            </div>
            <p className="mt-1">
              All uploaded files will be categorized as "{prioritizedCategories.find(c => c.value === preSelectedCategory)?.label}".
              {preSelectedCategory === 'receipts' && " Expense tracking fields will be automatically added."}
              {preSelectedCategory === 'photos' && " Location and timestamp metadata will be captured."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
