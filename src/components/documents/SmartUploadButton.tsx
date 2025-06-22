
import React from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SmartDocumentUpload } from './SmartDocumentUpload';

interface SmartUploadButtonProps {
  projectId?: string;
  onUploadComplete?: () => void;
  variant?: 'default' | 'compact' | 'floating' | 'minimal';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export const SmartUploadButton: React.FC<SmartUploadButtonProps> = ({
  projectId,
  onUploadComplete,
  variant = 'default',
  size = 'default',
  className,
  showTooltip = true
}) => {
  const getButtonContent = () => {
    switch (variant) {
      case 'minimal':
        return <Upload size={20} />;
      case 'compact':
        return (
          <>
            <Upload size={16} className="mr-2" />
            Upload
          </>
        );
      case 'floating':
        return <Sparkles size={24} />;
      default:
        return (
          <>
            <Sparkles size={20} className="mr-2" />
            Smart Upload
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "transition-all duration-200 hover:scale-105 hover:shadow-lg";
    
    switch (variant) {
      case 'floating':
        return `${baseStyles} rounded-full shadow-lg min-h-[56px] min-w-[56px] bg-blue-600 hover:bg-blue-700`;
      case 'minimal':
        return `${baseStyles} min-h-[44px] min-w-[44px] p-2 hover:bg-slate-100`;
      case 'compact':
        return `${baseStyles} min-h-[44px] bg-blue-600 hover:bg-blue-700`;
      default:
        return `${baseStyles} min-h-[44px] bg-blue-600 hover:bg-blue-700`;
    }
  };

  const triggerButton = (
    <Button
      variant={variant === 'minimal' ? 'ghost' : 'default'}
      size={size}
      className={`${getButtonStyles()} ${className}`}
    >
      {getButtonContent()}
    </Button>
  );

  const ButtonComponent = showTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {triggerButton}
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload documents with AI-powered categorization</p>
          <p className="text-xs text-slate-400">Ctrl+U</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : triggerButton;

  return (
    <SmartDocumentUpload
      projectId={projectId}
      onUploadComplete={onUploadComplete}
      variant="dialog"
      triggerButton={ButtonComponent}
      className={className}
    />
  );
};
