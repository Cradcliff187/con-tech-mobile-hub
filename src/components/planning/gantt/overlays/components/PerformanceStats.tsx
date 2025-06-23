
import React from 'react';

interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  isLowPerformance: boolean;
}

interface MobileCapabilities {
  isMobile: boolean;
  hasTouch: boolean;
  screenSize: string;
}

interface PerformanceStatsProps {
  metrics: PerformanceMetrics;
  mobileCapabilities: MobileCapabilities;
  finalMarkersCount: number;
  allMarkersCount: number;
  culledCount: number;
  isDragging: boolean;
  draggedTaskId?: string;
  currentValidity: 'valid' | 'warning' | 'invalid';
  affectedMarkerIds: string[];
  validDropZones: Array<{ start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }>;
}

export const PerformanceStats = ({
  metrics,
  mobileCapabilities,
  finalMarkersCount,
  allMarkersCount,
  culledCount,
  isDragging,
  draggedTaskId,
  currentValidity,
  affectedMarkerIds,
  validDropZones
}: PerformanceStatsProps) => {
  return (
    <div className="absolute bottom-2 left-2 bg-black/90 text-white text-xs p-3 rounded pointer-events-auto max-w-xs">
      <div className="space-y-1">
        <div className="font-semibold border-b border-white/20 pb-1">Performance Metrics</div>
        <div>FPS: <span className={metrics.fps < 30 ? 'text-red-400' : 'text-green-400'}>{metrics.fps}</span></div>
        <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
        <div>Markers: {finalMarkersCount}/{allMarkersCount}</div>
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
  );
};
