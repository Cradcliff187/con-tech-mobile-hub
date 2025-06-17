
import React, { useMemo, useState } from 'react';
import { Task } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Settings } from 'lucide-react';
import { 
  MarkerData, 
  batchMarkerUpdates,
  isMarkerVisible,
  MARKER_ZONES
} from '../utils/overlayUtils';
import { CollisionResolver } from '../markers/CollisionResolver';
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
  smartCollisions: boolean;
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
    criticalPath: true,
    smartCollisions: true
  });
  const [showControls, setShowControls] = useState(false);

  // Detect mobile viewport
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }, []);

  // Collect all markers from different sources for collision detection
  const allMarkers = useMemo(() => {
    const markers: MarkerData[] = [];
    
    // This is a simplified collection - in practice, each overlay component
    // would expose its markers for collision detection
    // For now, we'll use the individual components and apply collision detection
    // to any additional markers that might be added in the future
    
    return markers;
  }, [tasks, timelineStart, timelineEnd, overlayControls, projectId]);

  // Process markers for collision detection
  const processedMarkers = useMemo(() => {
    if (!overlayControls.smartCollisions) return allMarkers;
    return batchMarkerUpdates(allMarkers, timelineStart, timelineEnd, viewMode);
  }, [allMarkers, timelineStart, timelineEnd, viewMode, overlayControls.smartCollisions]);

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
      {/* Enhanced Overlay Controls */}
      <div className="absolute top-2 right-2 pointer-events-auto z-50">
        <div className="flex items-center gap-2">
          {showControls && (
            <div className="bg-white rounded-lg shadow-md border p-2 flex items-center gap-2 flex-wrap">
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
              <Button
                variant={overlayControls.smartCollisions ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('smartCollisions')}
                className="text-xs"
                title="Intelligent collision detection and resolution"
              >
                {overlayControls.smartCollisions ? <Eye size={12} /> : <EyeOff size={12} />}
                Smart Layout
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

      {/* Enhanced Overlay Layers with smart collision detection */}
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

        {/* Layer 2: Weather Overlays with collision detection (z-20) */}
        {overlayControls.weather && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.TERTIARY.zIndex }}>
            {overlayControls.smartCollisions ? (
              <CollisionResolver
                markers={visibleMarkers.filter(m => m.type === 'weather')}
                viewMode={viewMode}
                isMobile={isMobile}
                showDebugInfo={process.env.NODE_ENV === 'development'}
              />
            ) : (
              <GanttWeatherMarkers
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            )}
          </div>
        )}

        {/* Layer 3: Resource Conflicts with collision detection (z-30) */}
        {overlayControls.conflicts && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.SECONDARY.zIndex }}>
            {overlayControls.smartCollisions ? (
              <CollisionResolver
                markers={visibleMarkers.filter(m => m.type === 'conflict')}
                viewMode={viewMode}
                isMobile={isMobile}
              />
            ) : (
              <GanttResourceConflictMarkers
                tasks={tasks}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
              />
            )}
          </div>
        )}

        {/* Layer 4: Milestones with collision detection (z-40) - Highest Priority */}
        {overlayControls.milestones && projectId && (
          <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.PRIMARY.zIndex }}>
            {overlayControls.smartCollisions ? (
              <CollisionResolver
                markers={visibleMarkers.filter(m => m.type === 'milestone')}
                viewMode={viewMode}
                isMobile={isMobile}
              />
            ) : (
              <GanttMilestoneMarkers
                projectId={projectId}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            )}
          </div>
        )}

        {/* Universal Collision Resolver for all markers when smart collisions enabled */}
        {overlayControls.smartCollisions && visibleMarkers.length > 0 && (
          <div className="absolute inset-0" style={{ zIndex: 50 }}>
            <CollisionResolver
              markers={visibleMarkers}
              viewMode={viewMode}
              isMobile={isMobile}
              showDebugInfo={process.env.NODE_ENV === 'development'}
            />
          </div>
        )}
      </div>

      {/* Enhanced Performance Stats */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs p-2 rounded pointer-events-auto">
          <div>Markers: {visibleMarkers.length}/{processedMarkers.length}</div>
          <div>Timeline: {timelineStart.toLocaleDateString()} - {timelineEnd.toLocaleDateString()}</div>
          <div>View Mode: {viewMode}</div>
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Smart Collisions: {overlayControls.smartCollisions ? 'On' : 'Off'}</div>
        </div>
      )}
    </div>
  );
};
