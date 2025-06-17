
import { MarkerData } from './overlayUtils';

export interface CollisionGroup {
  id: string;
  markers: MarkerData[];
  position: { x: number; y: number };
  bounds: { left: number; right: number; top: number; bottom: number };
  strategy: 'stack' | 'cluster' | 'offset' | 'compound';
  priority: number;
}

export interface CollisionResolutionResult {
  resolved: MarkerData[];
  clusters: CollisionGroup[];
  hidden: MarkerData[];
}

// Enhanced collision detection with spatial indexing
export const detectAdvancedCollisions = (
  markers: MarkerData[],
  viewMode: 'days' | 'weeks' | 'months',
  isMobile: boolean = false
): CollisionGroup[] => {
  const tolerance = getCollisionTolerance(viewMode, isMobile);
  const minSpacing = isMobile ? 44 : 24; // Minimum touch target size
  const groups: CollisionGroup[] = [];
  const processed = new Set<string>();

  markers.forEach(marker => {
    if (processed.has(marker.id)) return;

    const collisionGroup: CollisionGroup = {
      id: `group-${marker.id}`,
      markers: [marker],
      position: { x: marker.position.x, y: marker.position.y },
      bounds: {
        left: marker.position.x - tolerance,
        right: marker.position.x + tolerance,
        top: marker.position.y,
        bottom: marker.position.y + minSpacing
      },
      strategy: 'stack',
      priority: marker.priority
    };

    // Find all markers that collide with this one
    markers.forEach(otherMarker => {
      if (otherMarker.id === marker.id || processed.has(otherMarker.id)) return;

      const isColliding = checkCollision(marker, otherMarker, tolerance, minSpacing);
      if (isColliding) {
        collisionGroup.markers.push(otherMarker);
        processed.add(otherMarker.id);
        
        // Update group bounds
        collisionGroup.bounds.left = Math.min(collisionGroup.bounds.left, otherMarker.position.x - tolerance);
        collisionGroup.bounds.right = Math.max(collisionGroup.bounds.right, otherMarker.position.x + tolerance);
        collisionGroup.priority = Math.max(collisionGroup.priority, otherMarker.priority);
      }
    });

    processed.add(marker.id);
    groups.push(collisionGroup);
  });

  return groups.filter(group => group.markers.length > 1);
};

// Intelligent resolution strategy selection
export const resolveCollisions = (
  collisionGroups: CollisionGroup[],
  viewMode: 'days' | 'weeks' | 'months',
  isMobile: boolean = false
): CollisionResolutionResult => {
  const resolved: MarkerData[] = [];
  const clusters: CollisionGroup[] = [];
  const hidden: MarkerData[] = [];

  collisionGroups.forEach(group => {
    const strategy = selectResolutionStrategy(group, viewMode, isMobile);
    group.strategy = strategy;

    switch (strategy) {
      case 'stack':
        const stackedMarkers = applyVerticalStacking(group, isMobile);
        resolved.push(...stackedMarkers);
        break;

      case 'cluster':
        const clusterResult = createMarkerCluster(group);
        clusters.push(clusterResult);
        break;

      case 'offset':
        const offsetMarkers = applyHorizontalOffset(group, viewMode);
        resolved.push(...offsetMarkers);
        break;

      case 'compound':
        const compoundMarker = createCompoundMarker(group);
        resolved.push(compoundMarker);
        break;

      default:
        // Fallback: hide lower priority markers
        const sortedByPriority = group.markers.sort((a, b) => b.priority - a.priority);
        resolved.push(sortedByPriority[0]);
        hidden.push(...sortedByPriority.slice(1));
    }
  });

  return { resolved, clusters, hidden };
};

// Strategy selection based on marker types and context
const selectResolutionStrategy = (
  group: CollisionGroup,
  viewMode: 'days' | 'weeks' | 'months',
  isMobile: boolean
): CollisionGroup['strategy'] => {
  const markerCount = group.markers.length;
  const hasHighPriority = group.markers.some(m => m.priority >= 80);
  const hasDifferentTypes = new Set(group.markers.map(m => m.type)).size > 1;

  // Mobile optimizations
  if (isMobile) {
    if (markerCount > 3) return 'cluster';
    if (hasDifferentTypes && markerCount <= 3) return 'compound';
    return 'stack';
  }

  // Desktop strategies
  if (markerCount > 5) return 'cluster';
  if (viewMode === 'days' && markerCount <= 3 && hasHighPriority) return 'stack';
  if (hasDifferentTypes && markerCount <= 3) return 'compound';
  if (viewMode === 'weeks' || viewMode === 'months') return 'offset';
  
  return 'stack';
};

// Vertical stacking with smart spacing
const applyVerticalStacking = (group: CollisionGroup, isMobile: boolean): MarkerData[] => {
  const spacing = isMobile ? 28 : 24;
  const sortedMarkers = group.markers.sort((a, b) => b.priority - a.priority);
  
  return sortedMarkers.map((marker, index) => ({
    ...marker,
    position: {
      ...marker.position,
      y: marker.position.y + (index * spacing)
    }
  }));
};

// Smart horizontal offset
const applyHorizontalOffset = (group: CollisionGroup, viewMode: 'days' | 'weeks' | 'months'): MarkerData[] => {
  const offsetAmount = viewMode === 'days' ? 0.5 : viewMode === 'weeks' ? 1 : 2;
  const sortedMarkers = group.markers.sort((a, b) => b.priority - a.priority);
  
  return sortedMarkers.map((marker, index) => ({
    ...marker,
    position: {
      ...marker.position,
      x: marker.position.x + (index * offsetAmount) - ((sortedMarkers.length - 1) * offsetAmount / 2)
    }
  }));
};

// Create clustered marker group
const createMarkerCluster = (group: CollisionGroup): CollisionGroup => {
  const primaryMarker = group.markers.reduce((prev, current) => 
    current.priority > prev.priority ? current : prev
  );

  return {
    ...group,
    strategy: 'cluster',
    position: primaryMarker.position
  };
};

// Create compound marker combining multiple indicators
const createCompoundMarker = (group: CollisionGroup): MarkerData => {
  const primaryMarker = group.markers.reduce((prev, current) => 
    current.priority > prev.priority ? current : prev
  );

  return {
    ...primaryMarker,
    id: `compound-${group.id}`,
    type: 'compound' as any,
    content: null,
    tooltip: {
      title: `${group.markers.length} items`,
      description: group.markers.map(m => m.tooltip?.title || m.type).join(', '),
      details: {
        types: group.markers.map(m => m.type),
        count: group.markers.length
      }
    }
  };
};

// Collision detection helpers
const checkCollision = (
  marker1: MarkerData,
  marker2: MarkerData,
  tolerance: number,
  minSpacing: number
): boolean => {
  const horizontalCollision = Math.abs(marker1.position.x - marker2.position.x) <= tolerance;
  const verticalCollision = Math.abs(marker1.position.y - marker2.position.y) < minSpacing;
  
  return horizontalCollision && verticalCollision;
};

const getCollisionTolerance = (viewMode: 'days' | 'weeks' | 'months', isMobile: boolean): number => {
  const baseTolerance = {
    days: 0.5,
    weeks: 2,
    months: 5
  };
  
  const mobileFactor = isMobile ? 1.5 : 1;
  return baseTolerance[viewMode] * mobileFactor;
};

// Performance optimization: spatial indexing for large marker sets
export const createSpatialIndex = (markers: MarkerData[]): Map<string, MarkerData[]> => {
  const index = new Map<string, MarkerData[]>();
  const gridSize = 10; // 10% grid cells
  
  markers.forEach(marker => {
    const gridX = Math.floor(marker.position.x / gridSize);
    const gridY = Math.floor(marker.position.y / gridSize);
    const key = `${gridX}-${gridY}`;
    
    if (!index.has(key)) {
      index.set(key, []);
    }
    index.get(key)!.push(marker);
  });
  
  return index;
};
