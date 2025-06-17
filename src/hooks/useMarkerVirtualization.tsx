
import { useMemo, useCallback } from 'react';
import { MarkerData } from '@/components/planning/gantt/utils/overlayUtils';

interface VirtualizationConfig {
  viewportBuffer: number;
  maxVisibleMarkers: number;
  isMobile: boolean;
}

interface SpatialIndex {
  [key: string]: MarkerData[];
}

export const useMarkerVirtualization = (
  markers: MarkerData[],
  viewportStart: number,
  viewportEnd: number,
  config: VirtualizationConfig
) => {
  // Create spatial index for O(log n) lookups
  const spatialIndex = useMemo((): SpatialIndex => {
    const index: SpatialIndex = {};
    const gridSize = config.isMobile ? 15 : 10; // Larger grid for mobile
    
    markers.forEach(marker => {
      const gridX = Math.floor(marker.position.x / gridSize);
      const key = `${gridX}`;
      
      if (!index[key]) {
        index[key] = [];
      }
      index[key].push(marker);
    });
    
    return index;
  }, [markers, config.isMobile]);

  // Get visible markers with viewport culling
  const visibleMarkers = useMemo(() => {
    const buffer = config.viewportBuffer;
    const culledStart = Math.max(0, viewportStart - buffer);
    const culledEnd = Math.min(100, viewportEnd + buffer);
    
    const gridSize = config.isMobile ? 15 : 10;
    const startGrid = Math.floor(culledStart / gridSize);
    const endGrid = Math.ceil(culledEnd / gridSize);
    
    const visible: MarkerData[] = [];
    
    for (let grid = startGrid; grid <= endGrid; grid++) {
      const gridMarkers = spatialIndex[grid.toString()] || [];
      
      for (const marker of gridMarkers) {
        if (marker.position.x >= culledStart && marker.position.x <= culledEnd) {
          visible.push(marker);
        }
      }
    }
    
    // Limit visible markers for performance
    const prioritized = visible
      .sort((a, b) => b.priority - a.priority)
      .slice(0, config.maxVisibleMarkers);
    
    return prioritized;
  }, [spatialIndex, viewportStart, viewportEnd, config]);

  // Level of Detail based on zoom
  const getMarkerLOD = useCallback((zoomLevel: number): 'high' | 'medium' | 'low' => {
    if (zoomLevel > 1.5) return 'high';
    if (zoomLevel > 0.8) return 'medium';
    return 'low';
  }, []);

  return {
    visibleMarkers,
    totalMarkers: markers.length,
    culledCount: markers.length - visibleMarkers.length,
    getMarkerLOD
  };
};
