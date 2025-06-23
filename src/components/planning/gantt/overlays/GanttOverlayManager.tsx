
import React, { useMemo } from 'react';
import { Task } from '@/types/database';
import { OverlayControlsPanel } from './components/OverlayControls';
import { PerformanceStats } from './components/PerformanceStats';
import { OverlayLayers } from './components/OverlayLayers';
import { useOverlayState } from './hooks/useOverlayState';
import { useMarkerProcessing } from './hooks/useMarkerProcessing';

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
  const {
    overlayControls,
    showControls,
    setShowControls,
    toggleOverlay
  } = useOverlayState();

  const {
    mobileCapabilities,
    metrics,
    allMarkers,
    culledCount,
    finalMarkers,
    currentLOD
  } = useMarkerProcessing({
    tasks,
    timelineStart,
    timelineEnd,
    overlayControls,
    projectId,
    isDragging,
    affectedMarkerIds,
    draggedTaskId
  });

  // Calculate drop indicator position
  const dropIndicatorPosition = useMemo(() => {
    if (!dropPreviewDate || !dragPosition) return { x: 0, y: 0 };
    
    const totalTime = timelineEnd.getTime() - timelineStart.getTime();
    const elapsed = dropPreviewDate.getTime() - timelineStart.getTime();
    const xPercent = Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
    
    return { x: xPercent, y: dragPosition.y };
  }, [dropPreviewDate, dragPosition, timelineStart, timelineEnd]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {/* Enhanced Overlay Controls */}
      <OverlayControlsPanel
        overlayControls={overlayControls}
        showControls={showControls}
        onToggleOverlay={toggleOverlay}
        onToggleControls={() => setShowControls(!showControls)}
      />

      {/* Enhanced Overlay Layers with performance optimizations */}
      <OverlayLayers
        overlayControls={overlayControls}
        tasks={tasks}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        viewMode={viewMode}
        finalMarkers={finalMarkers}
        mobileCapabilities={mobileCapabilities}
        currentLOD={currentLOD}
        isDragging={isDragging}
        dropPreviewDate={dropPreviewDate}
        dragPosition={dragPosition}
        currentValidity={currentValidity}
        validDropZones={validDropZones}
        showDropZones={showDropZones}
        violationMessages={violationMessages}
        suggestedDropDate={suggestedDropDate}
        dropIndicatorPosition={dropIndicatorPosition}
      />

      {/* Enhanced Performance Stats */}
      {overlayControls.performance && (
        <PerformanceStats
          metrics={metrics}
          mobileCapabilities={mobileCapabilities}
          finalMarkersCount={finalMarkers.length}
          allMarkersCount={allMarkers.length}
          culledCount={culledCount}
          isDragging={isDragging}
          draggedTaskId={draggedTaskId}
          currentValidity={currentValidity}
          affectedMarkerIds={affectedMarkerIds}
          validDropZones={validDropZones}
        />
      )}
    </div>
  );
};
