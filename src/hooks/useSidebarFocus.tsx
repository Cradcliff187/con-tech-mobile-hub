
import { useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export const useSidebarFocus = () => {
  const { state, isMobile } = useSidebar();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstNavItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Handle focus management when sidebar state changes
    if (state === 'expanded' && isMobile) {
      // On mobile, focus first navigation item when sidebar opens
      setTimeout(() => {
        const firstNavButton = document.querySelector('[data-sidebar="menu-button"]') as HTMLButtonElement;
        if (firstNavButton) {
          firstNavButton.focus();
        }
      }, 100); // Small delay for animation
    } else if (state === 'collapsed' && triggerRef.current) {
      // Return focus to trigger when sidebar closes
      triggerRef.current.focus();
    }
  }, [state, isMobile]);

  // Trap focus within sidebar on mobile when open
  useEffect(() => {
    if (!isMobile || state !== 'expanded') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close sidebar on Escape key
        const triggerButton = document.querySelector('[data-sidebar="trigger"]') as HTMLButtonElement;
        if (triggerButton) {
          triggerButton.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, state]);

  return {
    triggerRef,
    firstNavItemRef
  };
};
