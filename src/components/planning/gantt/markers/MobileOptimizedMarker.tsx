
import React, { memo } from 'react';
import { MarkerData } from '../utils/overlayUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TouchFriendlyButton } from '@/components/common/TouchFriendlyButton';

interface MobileOptimizedMarkerProps {
  marker: MarkerData;
  isMobile: boolean;
  lod: 'high' | 'medium' | 'low';
  onPress?: (marker: MarkerData) => void;
  onLongPress?: (marker: MarkerData) => void;
}

export const MobileOptimizedMarker = memo<MobileOptimizedMarkerProps>(({
  marker,
  isMobile,
  lod,
  onPress,
  onLongPress
}) => {
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Touch-friendly sizing based on mobile detection
  const getMarkerSize = () => {
    if (!isMobile) return 'w-6 h-6';
    
    switch (lod) {
      case 'high': return 'w-12 h-12 min-w-[44px] min-h-[44px]'; // WCAG compliant
      case 'medium': return 'w-10 h-10 min-w-[44px] min-h-[44px]';
      case 'low': return 'w-8 h-8 min-w-[44px] min-h-[44px]';
      default: return 'w-10 h-10 min-w-[44px] min-h-[44px]';
    }
  };

  // Optimized touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !onLongPress) return;
    
    e.preventDefault();
    const timer = setTimeout(() => {
      onLongPress(marker);
      // Haptic feedback for supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }, 500);
    
    setLongPressTimer(timer);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (onPress) {
      onPress(marker);
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Simplified rendering for low LOD
  if (lod === 'low') {
    return (
      <div
        className={`absolute ${getMarkerSize()} rounded-full ${marker.color} border-2 border-white shadow-sm transition-transform touch-manipulation`}
        style={{
          left: `${marker.position.x}%`,
          top: `${marker.position.y}px`,
          transform: 'translate(-50%, 0)'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      />
    );
  }

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${marker.position.x}%`,
        top: `${marker.position.y}px`,
        transform: 'translate(-50%, 0)'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <TouchFriendlyButton
            variant="ghost"
            className={`${getMarkerSize()} rounded-full ${marker.color} border-2 border-white shadow-sm transition-transform hover:scale-110 touch-manipulation flex items-center justify-center p-0`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onClick={() => onPress?.(marker)}
          >
            {marker.icon && lod === 'high' && (
              <div className="text-white">
                {marker.icon}
              </div>
            )}
          </TouchFriendlyButton>
        </TooltipTrigger>
        {marker.tooltip && (
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <div className="font-semibold text-slate-800">{marker.tooltip.title}</div>
              <div className="text-sm text-slate-600">{marker.tooltip.description}</div>
              {marker.tooltip.details && lod === 'high' && (
                <div className="text-xs text-slate-500 border-t pt-1">
                  {Object.entries(marker.tooltip.details).map(([key, value]) => (
                    <div key={key}>{key}: {String(value)}</div>
                  ))}
                </div>
              )}
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  );
});

MobileOptimizedMarker.displayName = 'MobileOptimizedMarker';
