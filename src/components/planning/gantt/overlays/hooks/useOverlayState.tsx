
import { useState } from 'react';

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
  smartCollisions: boolean;
  dropZones: boolean;
  performance: boolean;
}

export const useOverlayState = () => {
  const [overlayControls, setOverlayControls] = useState<OverlayControls>({
    milestones: true,
    weather: true,
    conflicts: true,
    criticalPath: true,
    smartCollisions: true,
    dropZones: true,
    performance: process.env.NODE_ENV === 'development'
  });
  
  const [showControls, setShowControls] = useState(false);

  const toggleOverlay = (type: keyof OverlayControls) => {
    setOverlayControls(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return {
    overlayControls,
    showControls,
    setShowControls,
    toggleOverlay
  };
};
