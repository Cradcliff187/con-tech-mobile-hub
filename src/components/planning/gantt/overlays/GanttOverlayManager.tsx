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
import { DragDropZoneIndicator, DropZoneGrid } from '../components/DragDropZoneIndicator';
import { MobileOptimizedMarker } from '../markers/MobileOptimizedMarker';
import { MarkerErrorBoundary, MarkerFallback } from '../markers/MarkerErrorBoundary';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useMarkerVirtualization } from '@/hooks/useMarkerVirtualization';
import { useDebouncedCalculations } from '@/hooks/useDebouncedCalculations';
import { useMobileDetection, getMobileOptimizedConfig } from '@/utils/mobileDetection';

interface GanttOverlayManagerProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  projectId?: string;
  className?: string;
  // Enhanced drag-aware props
  isDragging?: boolean;
  draggedTaskId?: string;
  affectedMarkerIds?: string[];
  dropPreviewDate?: Date | null;
  dragPosition?: { x: number; y: number } | null;
  currentValidity?: 'valid' | 'warning' | 'invalid';
  validDropZones?: Array<{ start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }>;
  showDropZones?: boolean;
  violationMessages?: string[];
  suggestedDropDate?: Date | null;
}

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
  smartCollisions: boolean;
  dropZones: boolean;
  performance: boolean;
}

export const GanttOverlayManager: React.FC<GanttOverlayManagerProps> = ({
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  projectId,
  className = '',
  // Drag-aware props
  isDragging = false,
  draggedTaskId,
  affectedMarkerIds = [],
  dropPreviewDate,
  dragPosition,
  currentValidity = 'valid',
  validDropZones = [],
  showDropZones = false,
  violationMessages = [],
  suggestedDropDate
}) => {
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

  // Mobile detection and optimization
  const mobileCapabilities = useMobileDetection();
  const mobileConfig = getMobileOptimizedConfig(mobileCapabilities);

  // Performance monitoring
  const { metrics, startRenderMeasurement, endRenderMeasurement } = usePerformanceMonitor(
    overlayControls.performance
  );

  // Collect all markers from different sources
  const allMarkers = useMemo(() => {
    startRenderMeasurement();
    const markers: MarkerData[] = [];
    
    // This would be populated by individual overlay components
    // For now, we'll use placeholder logic
    
    endRenderMeasurement(markers.length);
    return markers;
  }, [tasks, timelineStart, timelineEnd, overlayControls, projectId, startRenderMeasurement, endRenderMeasurement]);

  // Viewport-based virtualization
  const { visibleMarkers, culledCount, getMarkerLOD } = useMarkerVirtualization(
    allMarkers,
    0, // viewportStart - would be calculated from scroll position
    100, // viewportEnd - would be calculated from scroll position
    {
      viewportBuffer: mobileConfig.virtualBufferSize,
      maxVisibleMarkers: mobileConfig.maxVisibleMarkers,
      isMobile: mobileCapabilities.isMobile
    }
  );

  // Debounced marker processing for performance
  const { result: processedMarkers } = useDebouncedCalculations(
    () => {
      if (!overlayControls.smartCollisions) return visibleMarkers;
      
      let markers = batchMarkerUpdates(visibleMarkers, timelineStart, timelineEnd, viewMode);
      
      // Apply drag-aware transformations
      if (isDragging && affectedMarkerIds.length > 0) {
        markers = markers.map(marker => {
          const isAffected = affectedMarkerIds.some(id => marker.id.includes(id));
          const isDraggedMarker = draggedTaskId && marker.id.includes(draggedTaskId);
          
          if (!isAffected && !isDraggedMarker) {
            return {
              ...marker,
              color: marker.color.replace('bg-', 'bg-opacity-30 bg-')
            };
          }
          
          if (isAffected && !isDraggedMarker) {
            return {
              ...marker,
              color: 'bg-yellow-400 animate-pulse'
            };
          }
          
          return marker;
        });
      }
      
      return markers;
    },
    [visibleMarkers, timelineStart, timelineEnd, viewMode, overlayControls.smartCollisions, isDragging, affectedMarkerIds, draggedTaskId],
    mobileConfig.debounceDelay
  );

  const finalMarkers = processedMarkers || [];

  const toggleOverlay = (type: keyof OverlayControls) => {
    setOverlayControls(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Calculate drop indicator position
  const dropIndicatorPosition = useMemo(() => {
    if (!dropPreviewDate || !dragPosition) return { x: 0, y: 0 };
    
    const totalTime = timelineEnd.getTime() - timelineStart.getTime();
    const elapsed = dropPreviewDate.getTime() - timelineStart.getTime();
    const xPercent = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
    
    return { x: xPercent, y: dragPosition.y };
  }, [dropPreviewDate, dragPosition, timelineStart, timelineEnd]);

  // Get appropriate LOD for current zoom
  const currentLOD = getMarkerLOD(1); // Would calculate actual zoom level

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Enhanced Overlay Controls */}
      <div className="absolute top-2 right-2 pointer-events-auto z-50">
        <div className="flex items-center gap-2">
          {showControls && (
            <div className="bg-white rounded-lg shadow-md border p-2 flex items-center gap-2 flex-wrap max-w-4xl">
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
              <Button
                variant={overlayControls.dropZones ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('dropZones')}
                className="text-xs"
                title="Show valid drop zones during drag operations"
              >
                {overlayControls.dropZones ? <Eye size={12} /> : <EyeOff size={12} />}
                Drop Zones
              </Button>
              <Button
                variant={overlayControls.performance ? "default" : "outline"}
                size="sm"
                onClick={() => toggleOverlay('performance')}
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
            onClick={() => setShowControls(!showControls)}
            className="bg-white"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>

      {/* Enhanced Overlay Layers with performance optimizations */}
      <div className="absolute inset-0">
        {/* Layer 0: Drop Zone Grid (z-5) */}
        {overlayControls.dropZones && showDropZones && validDropZones.length > 0 && (
          <div className="absolute inset-0" style={{ zIndex: 5 }}>
            <DropZoneGrid
              zones={validDropZones}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
              isVisible={isDragging}
            />
          </div>
        )}

        {/* Layer 1: Critical Path Background (z-10) */}
        {overlayControls.criticalPath && (
          <MarkerErrorBoundary>
            <div className="absolute inset-0" style={{ zIndex: MARKER_ZONES.BACKGROUND.zIndex }}>
              <GanttCriticalPathOverlay
                tasks={tasks}
                timelineStart={timelineStart}
                timelineEnd={timelineEnd}
                viewMode={viewMode}
              />
            </div>
          </MarkerErrorBoundary>
        )}

        {/* Optimized Individual Markers */}
        {finalMarkers.map(marker => (
          <MarkerErrorBoundary 
            key={marker.id}
            fallback={<MarkerFallback position={marker.position} />}
          >
            <MobileOptimizedMarker
              marker={marker}
              isMobile={mobileCapabilities.isMobile}
              lod={currentLOD}
              onPress={(marker) => console.log('Marker pressed:', marker.id)}
              onLongPress={(marker) => console.log('Marker long pressed:', marker.id)}
            />
          </MarkerErrorBoundary>
        ))}

        {/* Layer 5: Drag Drop Indicator (z-60) */}
        {isDragging && dropPreviewDate && dragPosition && overlayControls.dropZones && (
          <div className="absolute inset-0" style={{ zIndex: 60 }}>
            <DragDropZoneIndicator
              isVisible={true}
              position={dropIndicatorPosition}
              validity={currentValidity}
              violations={violationMessages}
              suggestedDate={suggestedDropDate}
            />
          </div>
        )}
      </div>

      {/* Enhanced Performance Stats */}
      {overlayControls.performance && (
        <div className="absolute bottom-2 left-2 bg-black/90 text-white text-xs p-3 rounded pointer-events-auto max-w-xs">
          <div className="space-y-1">
            <div className="font-semibold border-b border-white/20 pb-1">Performance Metrics</div>
            <div>FPS: <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>{metrics.fps}</span></div>
            <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
            <div>Markers: {finalMarkers.length}/{allMarkers.length}</div>
            <div>Culled: {culledCount}</div>
            <div>Memory: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
            <div>Mobile: {mobileCapabilities.isMobile ? 'Yes' : 'No'}</div>
            <div>Touch: {mobileCapabilities.hasTouch ? 'Yes' : 'No'}</div>
            <div>Screen: {mobileCapabilities.screenSize}</div>
            {metrics.isLowPerformance && (
              <div className="text-red-400 font-semibold animate-pulse">
                Low Performance
              </div>
            )}
            {isDragging && (
              <div className="border-t border-white/20 pt-1 mt-1">
                <div>Dragging: {draggedTaskId?.slice(0, 8)}...</div>
                <div>Validity: {currentValidity}</div>
                <div>Affected: {affectedMarkerIds.length}</div>
                <div>Drop Zones: {validDropZones.length}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
