
import React from 'react';
import { Task } from '@/types/database';
import { MarkerData, MARKER_ZONES } from '../../utils/overlayUtils';
import { GanttCriticalPathOverlay } from '../GanttCriticalPathOverlay';
import { DragDropZoneIndicator, DropZoneGrid } from '../../components/DragDropZoneIndicator';
import { MobileOptimizedMarker } from '../../markers/MobileOptimizedMarker';
import { MarkerErrorBoundary, MarkerFallback } from '../../markers/MarkerErrorBoundary';

interface OverlayControls {
  milestones: boolean;
  weather: boolean;
  conflicts: boolean;
  criticalPath: boolean;
  smartCollisions: boolean;
  dropZones: boolean;
  performance: boolean;
}

interface MobileCapabilities {
  isMobile: boolean;
  hasTouch: boolean;
  screenSize: string;
}

interface OverlayLayersProps {
  overlayControls: OverlayControls;
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  finalMarkers: MarkerData[];
  mobileCapabilities: MobileCapabilities;
  currentLOD: 'high' | 'medium' | 'low';
  isDragging: boolean;
  dropPreviewDate?: Date | null;
  dragPosition?: { x: number; y: number } | null;
  currentValidity: 'valid' | 'warning' | 'invalid';
  validDropZones: Array<{ start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }>;
  showDropZones: boolean;
  violationMessages: string[];
  suggestedDropDate?: Date | null;
  dropIndicatorPosition: { x: number; y: number };
}

export const OverlayLayers = ({
  overlayControls,
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  finalMarkers,
  mobileCapabilities,
  currentLOD,
  isDragging,
  dropPreviewDate,
  dragPosition,
  currentValidity,
  validDropZones,
  showDropZones,
  violationMessages,
  suggestedDropDate,
  dropIndicatorPosition
}: OverlayLayersProps) => {
  return (
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
  );
};
