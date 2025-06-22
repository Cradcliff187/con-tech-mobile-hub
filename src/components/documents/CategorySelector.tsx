
import React from 'react';
import { FileText, Camera, Receipt, Shield, Building, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  isPriority?: boolean;
}

interface CategorySelectorProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  projectPhase?: string;
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  projectPhase,
  disabled = false
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.value;
          
          return (
            <Button
              key={category.value}
              variant={isSelected ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              } ${category.isPriority ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' : ''}`}
              onClick={() => onCategorySelect(category.value)}
              disabled={disabled}
            >
              <div className="flex items-center justify-center">
                <Icon 
                  size={24} 
                  className={isSelected ? 'text-white' : category.isPriority ? 'text-blue-600' : 'text-slate-600'} 
                />
                {category.isPriority && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                    Recommended
                  </Badge>
                )}
              </div>
              <div>
                <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {category.label}
                </div>
                <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {category.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
      
      {projectPhase && (
        <div className="text-xs text-slate-600 text-center">
          Categories are optimized for the <span className="font-medium capitalize">{projectPhase}</span> phase
        </div>
      )}
    </div>
  );
};
