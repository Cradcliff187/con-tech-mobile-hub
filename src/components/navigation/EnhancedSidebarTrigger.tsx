
import { PanelLeft } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface EnhancedSidebarTriggerProps {
  className?: string;
  floating?: boolean;
}

export const EnhancedSidebarTrigger = ({ 
  className, 
  floating = false 
}: EnhancedSidebarTriggerProps) => {
  const { state } = useSidebar();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const shortcutText = isMac ? '⌘+B' : 'Ctrl+B';
  const tooltipText = `Toggle Sidebar (${shortcutText})`;

  const triggerClasses = cn(
    // Base styles
    "flex items-center justify-center",
    "transition-all duration-200 ease-out",
    "hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-orange-500",
    
    // Floating styles
    floating && [
      "fixed top-6 left-6 z-40",
      "bg-white border border-slate-200 shadow-md rounded-lg",
      "w-10 h-10 md:w-10 md:h-10",
      "hover:shadow-lg hover:-translate-y-0.5",
      "active:translate-y-0 active:shadow-md",
      // Hide when sidebar is open on desktop
      "lg:data-[state=expanded]:opacity-0 lg:data-[state=expanded]:pointer-events-none"
    ],
    
    // Non-floating styles
    !floating && "h-7 w-7",
    
    className
  );

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <SidebarTrigger 
          className={triggerClasses}
          data-state={state}
        >
          <PanelLeft 
            size={floating ? 18 : 16} 
            className="text-slate-600" 
          />
          <span className="sr-only">{tooltipText}</span>
        </SidebarTrigger>
      </TooltipTrigger>
      <TooltipContent 
        side="right" 
        align="center"
        className="bg-slate-900 text-white text-sm"
      >
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};
