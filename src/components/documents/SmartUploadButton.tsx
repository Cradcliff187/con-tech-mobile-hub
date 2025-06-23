
import React, { useState } from 'react';
import { Upload, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { SmartDocumentUpload } from './SmartDocumentUpload';
import { useProjects } from '@/hooks/useProjects';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Get current project info for intelligent labeling
  const currentProject = projects.find(p => p.id === projectId);
  const projectPhase = currentProject?.phase || 'planning';

  const getPhaseSpecificLabel = () => {
    if (isMobile) {
      switch (projectPhase) {
        case 'planning': return 'Plans';
        case 'active': return 'Progress';
        case 'punch_list': return 'Issues';
        case 'closeout': return 'Final';
        default: return 'Upload';
      }
    }
    
    switch (projectPhase) {
      case 'planning': return 'Upload Plans';
      case 'active': return 'Add Progress';
      case 'punch_list': return 'Upload Issues';
      case 'closeout': return 'Final Docs';
      default: return 'Smart Upload';
    }
  };

  const getButtonContent = () => {
    const iconSize = isMobile ? 18 : 16;
    
    switch (variant) {
      case 'minimal':
        return <Upload size={iconSize} />;
      case 'compact':
        return (
          <>
            <Plus size={iconSize} className="mr-2" />
            {projectId ? getPhaseSpecificLabel() : (isMobile ? 'Upload' : 'Upload')}
          </>
        );
      case 'floating':
        return (
          <div className="flex flex-col items-center">
            <Sparkles size={isMobile ? 28 : 24} />
            {projectId && !isMobile && (
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
            <Sparkles size={iconSize} className="mr-2" />
            {projectId ? getPhaseSpecificLabel() : (isMobile ? 'Upload' : 'Smart Upload')}
            {projectId && projectPhase !== 'planning' && !isMobile && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {projectPhase}
              </Badge>
            )}
          </>
        );
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "transition-all duration-200 hover:scale-105 hover:shadow-lg touch-manipulation active:scale-95";
    const mobileHeight = isMobile ? 'min-h-[48px]' : 'min-h-[44px]';
    
    switch (variant) {
      case 'floating':
        return `${baseStyles} rounded-full shadow-lg ${
          isMobile ? 'min-h-[64px] min-w-[64px]' : 'min-h-[56px] min-w-[56px]'
        } bg-blue-600 hover:bg-blue-700`;
      case 'minimal':
        return `${baseStyles} ${mobileHeight} ${
          isMobile ? 'min-w-[48px] p-3' : 'min-w-[44px] p-2'
        } hover:bg-slate-100`;
      case 'compact':
        return `${baseStyles} ${mobileHeight} bg-blue-600 hover:bg-blue-700`;
      default:
        return `${baseStyles} ${mobileHeight} bg-blue-600 hover:bg-blue-700`;
    }
  };

  const getTooltipContent = () => {
    if (!projectId) {
      return (
        <div>
          <p>{isMobile ? 'AI-powered upload' : 'Upload documents with AI-powered categorization'}</p>
          {!isMobile && <p className="text-xs text-slate-400">Ctrl+U</p>}
        </div>
      );
    }

    const phaseActions = {
      planning: isMobile ? 'Upload plans & permits' : 'Upload plans, permits, and contracts',
      active: isMobile ? 'Add photos & receipts' : 'Add progress photos and expense receipts',
      punch_list: isMobile ? 'Document issues' : 'Document punch list items and issues',
      closeout: isMobile ? 'Final docs' : 'Upload final documentation and reports'
    };

    return (
      <div>
        <p>{phaseActions[projectPhase as keyof typeof phaseActions] || 'Upload project documents'}</p>
        {!isMobile && <p className="text-xs text-slate-400">Smart categorization enabled • Ctrl+U</p>}
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

  const ButtonComponent = showTooltip && !isMobile ? (
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
