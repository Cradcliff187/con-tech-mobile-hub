
import React from 'react';
import { FileText, Camera, Receipt, Shield, Building, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.value;
          
          return (
            <Button
              key={category.value}
              variant={isSelected ? 'default' : 'outline'}
              className={`
                h-auto p-3 flex items-center justify-start gap-3 text-left transition-all duration-200 
                hover:scale-[1.02] active:scale-95 touch-manipulation w-full
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''} 
                ${category.isPriority ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' : ''}
              `}
              onClick={() => onCategorySelect(category.value)}
              disabled={disabled}
            >
              <Icon 
                size={isMobile ? 20 : 18} 
                className={`flex-shrink-0 ${
                  isSelected ? 'text-white' : category.isPriority ? 'text-blue-600' : 'text-slate-600'
                }`} 
              />
              <div className="flex-1 min-w-0 text-left">
                <div className={`font-medium truncate ${
                  isMobile ? 'text-sm' : 'text-xs'
                } ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {category.label}
                </div>
                {!isMobile && !isSelected && (
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {category.description}
                  </div>
                )}
              </div>
              {category.isPriority && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs flex-shrink-0 ${
                    isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isMobile ? 'Rec' : 'Recommended'}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      {projectPhase && (
        <div className="text-center text-xs text-slate-600">
          Optimized for <span className="font-medium capitalize">{projectPhase}</span> phase
        </div>
      )}
    </div>
  );
};
