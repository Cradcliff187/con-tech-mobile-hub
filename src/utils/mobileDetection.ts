
import React from 'react';

export interface MobileCapabilities {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  supportsHaptic: boolean;
  pixelRatio: number;
}

export const detectMobileCapabilities = (): MobileCapabilities => {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Enhanced mobile detection
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
    (hasTouch && width < 768);
  
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) ||
    (hasTouch && width >= 768 && width < 1024);
  
  const isDesktop = !isMobile && !isTablet;
  
  // Screen size classification
  let screenSize: 'small' | 'medium' | 'large' = 'large';
  if (width < 640) screenSize = 'small';
  else if (width < 1024) screenSize = 'medium';
  
  const orientation = width > height ? 'landscape' : 'portrait';
  const supportsHaptic = 'vibrate' in navigator;
  const pixelRatio = window.devicePixelRatio || 1;

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    screenSize,
    orientation,
    supportsHaptic,
    pixelRatio
  };
};

export const getMobileOptimizedConfig = (capabilities: MobileCapabilities) => {
  return {
    markerSize: capabilities.isMobile ? 44 : 24, // WCAG minimum 44px
    touchTargetPadding: capabilities.hasTouch ? 8 : 4,
    animationDuration: capabilities.isMobile ? 200 : 300,
    clusterThreshold: capabilities.screenSize === 'small' ? 3 : 5,
    maxVisibleMarkers: capabilities.screenSize === 'small' ? 20 : 50,
    debounceDelay: capabilities.isMobile ? 8 : 16, // Faster for mobile
    virtualBufferSize: capabilities.screenSize === 'small' ? 10 : 20
  };
};

// Hook for reactive mobile detection
export const useMobileDetection = () => {
  const [capabilities, setCapabilities] = React.useState<MobileCapabilities>(() => 
    detectMobileCapabilities()
  );

  React.useEffect(() => {
    const handleResize = () => {
      setCapabilities(detectMobileCapabilities());
    };

    const handleOrientationChange = () => {
      // Delay to ensure accurate dimensions after orientation change
      setTimeout(() => {
        setCapabilities(detectMobileCapabilities());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return capabilities;
};
