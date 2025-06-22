
import React, { useState } from 'react';
import { Upload, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { SmartDocumentUpload } from './SmartDocumentUpload';
import { useProjects } from '@/hooks/useProjects';

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
  const [isOpen, setIsOpen] = useState(false);
  const { projects } = useProjects();
  
  // Get current project info for intelligent labeling
  const currentProject = projects.find(p => p.id === projectId);
  const projectPhase = currentProject?.phase || 'planning';

  const getPhaseSpecificLabel = () => {
    switch (projectPhase) {
      case 'planning':
        return 'Upload Plans';
      case 'active':
        return 'Add Progress';
      case 'punch_list':
        return 'Upload Issues';
      case 'closeout':
        return 'Final Docs';
      default:
        return 'Smart Upload';
    }
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'minimal':
        return <Upload size={20} />;
      case 'compact':
        return (
          <>
            <Plus size={16} className="mr-2" />
            {projectId ? getPhaseSpecificLabel() : 'Upload'}
          </>
        );
      case 'floating':
        return (
          <div className="flex flex-col items-center">
            <Sparkles size={24} />
            {projectId && (
              <Badge 
                variant="secondary" 
                className="mt-1 text-xs bg-white/20 text-white border-white/30"
              >
                {projectPhase}
              </Badge>
            )}
          </div>
        );
      default:
        return (
          <>
            <Sparkles size={20} className="mr-2" />
            {projectId ? getPhaseSpecificLabel() : 'Smart Upload'}
            {projectId && projectPhase !== 'planning' && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {projectPhase}
              </Badge>
            )}
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

  const getTooltipContent = () => {
    if (!projectId) {
      return (
        <div>
          <p>Upload documents with AI-powered categorization</p>
          <p className="text-xs text-slate-400">Ctrl+U</p>
        </div>
      );
    }

    const phaseActions = {
      planning: 'Upload plans, permits, and contracts',
      active: 'Add progress photos and expense receipts',
      punch_list: 'Document punch list items and issues',
      closeout: 'Upload final documentation and reports'
    };

    return (
      <div>
        <p>{phaseActions[projectPhase as keyof typeof phaseActions] || 'Upload project documents'}</p>
        <p className="text-xs text-slate-400">Smart categorization enabled • Ctrl+U</p>
      </div>
    );
  };

  const handleClick = () => {
    console.log('SmartUploadButton clicked, opening dialog');
    setIsOpen(true);
  };

  const triggerButton = (
    <Button
      variant={variant === 'minimal' ? 'ghost' : 'default'}
      size={size}
      className={`${getButtonStyles()} ${className}`}
      onClick={handleClick}
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
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : triggerButton;

  return (
    <>
      {ButtonComponent}
      <SmartDocumentUpload
        projectId={projectId}
        onUploadComplete={onUploadComplete}
        variant="dialog"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};
