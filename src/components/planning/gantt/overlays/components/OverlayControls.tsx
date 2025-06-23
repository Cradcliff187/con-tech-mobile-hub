
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Settings } from 'lucide-react';

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
  smartCollisions: boolean;
  dropZones: boolean;
  performance: boolean;
}

interface OverlayControlsProps {
  overlayControls: OverlayControls;
  showControls: boolean;
  onToggleOverlay: (type: keyof OverlayControls) => void;
  onToggleControls: () => void;
}

export const OverlayControlsPanel = ({
  overlayControls,
  showControls,
  onToggleOverlay,
  onToggleControls
}: OverlayControlsProps) => {
  return (
    <div className="absolute top-2 right-2 pointer-events-auto z-50">
      <div className="flex items-center gap-2">
        {showControls && (
          <div className="bg-white rounded-lg shadow-md border p-2 flex items-center gap-2 flex-wrap max-w-4xl">
            <Button
              variant={overlayControls.milestones ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('milestones')}
              className="text-xs"
            >
              <Eye size={12} className="mr-1" />
              Milestones
            </Button>
            <Button
              variant={overlayControls.weather ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('weather')}
              className="text-xs"
            >
              {overlayControls.weather ? <Eye size={12} /> : <EyeOff size={12} />}
              Weather
            </Button>
            <Button
              variant={overlayControls.conflicts ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('conflicts')}
              className="text-xs"
            >
              {overlayControls.conflicts ? <Eye size={12} /> : <EyeOff size={12} />}
              Conflicts
            </Button>
            <Button
              variant={overlayControls.criticalPath ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('criticalPath')}
              className="text-xs"
            >
              {overlayControls.criticalPath ? <Eye size={12} /> : <EyeOff size={12} />}
              Critical Path
            </Button>
            <Button
              variant={overlayControls.smartCollisions ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('smartCollisions')}
              className="text-xs"
              title="Intelligent collision detection and resolution"
            >
              {overlayControls.smartCollisions ? <Eye size={12} /> : <EyeOff size={12} />}
              Smart Layout
            </Button>
            <Button
              variant={overlayControls.dropZones ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('dropZones')}
              className="text-xs"
              title="Show valid drop zones during drag operations"
            >
              {overlayControls.dropZones ? <Eye size={12} /> : <EyeOff size={12} />}
              Drop Zones
            </Button>
            <Button
              variant={overlayControls.performance ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleOverlay('performance')}
              className="text-xs"
              title="Performance monitoring and optimization"
            >
              {overlayControls.performance ? <Eye size={12} /> : <EyeOff size={12} />}
              Performance
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleControls}
          className="bg-white"
        >
          <Settings size={14} />
        </Button>
      </div>
    </div>
  );
};
