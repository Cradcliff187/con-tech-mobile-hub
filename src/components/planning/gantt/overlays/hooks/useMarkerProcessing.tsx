
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { MarkerData, batchMarkerUpdates } from '../../utils/overlayUtils';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useMarkerVirtualization } from '@/hooks/useMarkerVirtualization';
import { useDebouncedCalculations } from '@/hooks/useDebouncedCalculations';
import { useMobileDetection, getMobileOptimizedConfig } from '@/utils/mobileDetection';

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
  smartCollisions: boolean;
  dropZones: boolean;
  performance: boolean;
}

interface UseMarkerProcessingProps {
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  overlayControls: OverlayControls;
  projectId?: string;
  isDragging: boolean;
  affectedMarkerIds: string[];
  draggedTaskId?: string;
}

export const useMarkerProcessing = ({
  tasks,
  timelineStart,
  timelineEnd,
  overlayControls,
  projectId,
  isDragging,
  affectedMarkerIds,
  draggedTaskId
}: UseMarkerProcessingProps) => {
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
      
      let markers = batchMarkerUpdates(visibleMarkers, timelineStart, timelineEnd, 'days');
      
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
    [visibleMarkers, timelineStart, timelineEnd, overlayControls.smartCollisions, isDragging, affectedMarkerIds, draggedTaskId],
    mobileConfig.debounceDelay
  );

  const finalMarkers = processedMarkers || [];

  // Get appropriate LOD for current zoom
  const currentLOD = getMarkerLOD(1); // Would calculate actual zoom level

  return {
    mobileCapabilities,
    mobileConfig,
    metrics,
    allMarkers,
    visibleMarkers,
    culledCount,
    finalMarkers,
    currentLOD,
    getMarkerLOD
  };
};
