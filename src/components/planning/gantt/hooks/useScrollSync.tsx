
import { useRef, useEffect } from 'react';

export const useScrollSync = () => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  // Simplified scroll synchronization
  useEffect(() => {
    const headerScroll = headerScrollRef.current;
    const contentScroll = contentScrollRef.current;

    if (!headerScroll || !contentScroll) return;

    const syncScrollLeft = (source: HTMLElement, target: HTMLElement) => {
      target.scrollLeft = source.scrollLeft;
    };

    const handleHeaderScroll = () => syncScrollLeft(headerScroll, contentScroll);
    const handleContentScroll = () => syncScrollLeft(contentScroll, headerScroll);

    headerScroll.addEventListener('scroll', handleHeaderScroll, { passive: true });
    contentScroll.addEventListener('scroll', handleContentScroll, { passive: true });

    return () => {
      headerScroll.removeEventListener('scroll', handleHeaderScroll);
      contentScroll.removeEventListener('scroll', handleContentScroll);
    };
  }, []);

  return {
    headerScrollRef,
    contentScrollRef
  };
};
