
import React, { useMemo, useState } from 'react';
import { Task } from '@/types/database';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { 
  MarkerData, 
  batchMarkerUpdates,
  resolveMarkerCollisions,
  isMarkerVisible,
  MARKER_ZONES
} from '../utils/overlayUtils';
import { GanttMilestoneMarkers } from './GanttMilestoneMarkers';
import { GanttWeatherMarkers } from './GanttWeatherMarkers';
import { GanttResourceConflictMarkers } from './GanttResourceConflictMarkers';
import { GanttCriticalPathOverlay } from './GanttCriticalPathOverlay';

interface GanttOverlayManagerProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  projectId?: string;
  className?: string;
}

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
}

export const GanttOverlayManager: React.FC<GanttOverlayManagerProps> = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  projectId,
  className = ''
}) => {
  const [overlayControls, setOverlayControls] = useState<OverlayControls>({
    milestones: true,
    weather: true,
    conflicts: true,
    criticalPath: true
  });
  const [showControls, setShowControls] = useState(false);

  // Collect all markers from different sources
  const allMarkers = useMemo(() => {
    const markers: MarkerData[] = [];
    // Note: Individual marker components now handle their own positioning
    // This could be enhanced to collect markers from all sources for unified collision detection
    return markers;
  }, [tasks, timelineStart, timelineEnd, overlayControls, projectId]);

  // Process markers for positioning and collision resolution
  const processedMarkers = useMemo(() => {
    const withPositions = batchMarkerUpdates(allMarkers, timelineStart, timelineEnd, viewMode);
    return resolveMarkerCollisions(withPositions);
  }, [allMarkers, timelineStart, timelineEnd, viewMode]);

  // Filter visible markers for performance
  const visibleMarkers = useMemo(() => {
    return processedMarkers.filter(marker => 
      isMarkerVisible(marker.position.x, 0, 100)
    );
  }, [processedMarkers]);

  const toggleOverlay = (type: keyof OverlayControls) => {
    setOverlayControls(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Overlay Controls */}
      <div className="absolute top-2 right-2 pointer-events-auto z-50">
        <div className="flex items-center gap-2">
          {showControls && (
            <div className="bg-white rounded-lg shadow-md border p-2 flex items-center gap-2">
              <Button
                variant={overlayControls.milestones ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('milestones')}
                className="text-xs"
              >
                <Eye size={12} className="mr-1" />
                Milestones
              </Button>
              <Button
                variant={overlayControls.weather ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('weather')}
                className="text-xs"
              >
                {overlayControls.weather ? <Eye size={12} /> : <EyeOff size={12} />}
                Weather
              </Button>
              <Button
                variant={overlayControls.conflicts ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('conflicts')}
                className="text-xs"
              >
                {overlayControls.conflicts ? <Eye size={12} /> : <EyeOff size={12} />}
                Conflicts
              </Button>
              <Button
                variant={overlayControls.criticalPath ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('criticalPath')}
                className="text-xs"
              >
                {overlayControls.criticalPath ? <Eye size={12} /> : <EyeOff size={12} />}
                Critical Path
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControls(!showControls)}
            className="bg-white"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      {/* Unified Overlay Layers with proper z-index management */}
      <div className="absolute inset-0">
        {/* Layer 1: Critical Path Background (z-10) */}
        {overlayControls.criticalPath && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.BACKGROUND.zIndex }}>
            <GanttCriticalPathOverlay
              tasks={tasks}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Layer 2: Weather Overlays (z-20) */}
        {overlayControls.weather && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.TERTIARY.zIndex }}>
            <GanttWeatherMarkers
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Layer 3: Resource Conflicts (z-30) */}
        {overlayControls.conflicts && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.SECONDARY.zIndex }}>
            <GanttResourceConflictMarkers
              tasks={tasks}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
            />
          </div>
        )}

        {/* Layer 4: Milestones (z-40) - Highest Priority */}
        {overlayControls.milestones && projectId && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.PRIMARY.zIndex }}>
            <GanttMilestoneMarkers
              projectId={projectId}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Unified Marker Renderer for additional markers */}
        <div className="absolute inset-0" style={{ zIndex: 50 }}>
          {visibleMarkers.map(marker => (
            <Tooltip key={marker.id}>
              <TooltipTrigger asChild>
                <div
                  className="absolute pointer-events-auto"
                  style={{
                    left: `${marker.position.x}%`,
                    top: `${16 + marker.position.y}px`
                  }}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${marker.color} shadow-sm`}>
                    {marker.icon}
                  </div>
                </div>
              </TooltipTrigger>
              {marker.tooltip && (
                <TooltipContent side="bottom" className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-semibold">{marker.tooltip.title}</div>
                    <div className="text-sm text-slate-600">{marker.tooltip.description}</div>
                    {marker.tooltip.details && (
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
          ))}
        </div>
      </div>

      {/* Performance Stats (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs p-2 rounded pointer-events-auto">
          Markers: {visibleMarkers.length}/{processedMarkers.length}
          <div>Timeline: {timelineStart.toLocaleDateString()} - {timelineEnd.toLocaleDateString()}</div>
          <div>View Mode: {viewMode}</div>
        </div>
      )}
    </div>
  );
};
