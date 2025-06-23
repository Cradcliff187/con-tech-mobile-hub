
import React from 'react';
import { Label } from '@/components/ui/label';
import { CategorySelector } from './CategorySelector';
import { Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CategorySelectionPanelProps {
  preSelectedCategory: string;
  onCategorySelect: (category: string) => void;
  prioritizedCategories: any[];
  projectPhase: string;
  isUploading: boolean;
}

export const CategorySelectionPanel: React.FC<CategorySelectionPanelProps> = ({
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
              ? 'Select document type for AI categorization'
              : 'Choose document type for intelligent categorization and processing'
            }
          </p>
        </div>

        {/* Document Category Selection */}
        <div>
          <Label className="text-slate-700 font-medium text-xs">
            Document Type
            {!isMobile && projectPhase !== 'planning' && (
              <span className="text-xs text-blue-600 ml-1">({projectPhase} phase)</span>
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
              {!isMobile && preSelectedCategory === 'receipts' && " Expense fields will be auto-detected."}
              {!isMobile && preSelectedCategory === 'photos' && " Metadata will be captured automatically."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
