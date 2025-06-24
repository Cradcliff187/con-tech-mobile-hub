
import { useRef, useEffect } from 'react';

export const useScrollSync = () => {
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const headerElement = headerScrollRef.current;
    const contentElement = contentScrollRef.current;

    if (!headerElement || !contentElement) return;

    const syncHeaderToContent = () => {
      if (headerElement && contentElement) {
        headerElement.scrollLeft = contentElement.scrollLeft;
      }
    };

    const syncContentToHeader = () => {
      if (headerElement && contentElement) {
        contentElement.scrollLeft = headerElement.scrollLeft;
      }
    };

    contentElement.addEventListener('scroll', syncHeaderToContent);
    headerElement.addEventListener('scroll', syncContentToHeader);

    return () => {
      contentElement.removeEventListener('scroll', syncHeaderToContent);
      headerElement.removeEventListener('scroll', syncContentToHeader);
    };
  }, []);

  return {
    headerScrollRef,
    contentScrollRef
  };
};
