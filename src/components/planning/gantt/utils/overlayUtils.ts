
import { Task } from '@/types/database';

export interface MarkerData {
  id: string;
  date: Date;
  type: 'milestone' | 'weather' | 'conflict' | 'critical';
  priority: number;
  content: React.ReactNode;
  position: { x: number; y: number };
  color: string;
  icon?: React.ReactNode;
  tooltip?: {
    title: string;
    description: string;
    details?: Record<string, any>;
  };
}

export interface TimelineBounds {
  start: Date;
  end: Date;
  totalDays: number;
}

// Standardized timeline position calculation
export const calculateTimelinePosition = (
  markerDate: Date,
  timelineBounds: TimelineBounds
): number => {
  const { start, end } = timelineBounds;
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const daysFromStart = Math.ceil((markerDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, Math.min(100, (daysFromStart / totalDays) * 100));
};

// Collision detection for markers at same position
export const detectMarkerCollisions = (markers: MarkerData[]): MarkerData[][] => {
  const positionGroups = new Map<number, MarkerData[]>();
  const tolerance = 2; // 2% position tolerance

  markers.forEach(marker => {
    const position = Math.round(marker.position.x / tolerance) * tolerance;
    if (!positionGroups.has(position)) {
      positionGroups.set(position, []);
    }
    positionGroups.get(position)!.push(marker);
  });

  return Array.from(positionGroups.values()).filter(group => group.length > 1);
};

// Smart spacing for overlapping markers
export const resolveMarkerCollisions = (markers: MarkerData[]): MarkerData[] => {
  const collisionGroups = detectMarkerCollisions(markers);
  const resolvedMarkers = [...markers];

  collisionGroups.forEach(group => {
    // Sort by priority (higher priority gets better positioning)
    group.sort((a, b) => b.priority - a.priority);
    
    group.forEach((marker, index) => {
      const markerIndex = resolvedMarkers.findIndex(m => m.id === marker.id);
      if (markerIndex !== -1) {
        // Stack markers vertically with 24px spacing
        resolvedMarkers[markerIndex] = {
          ...marker,
          position: {
            ...marker.position,
            y: index * 24
          }
        };
      }
    });
  });

  return resolvedMarkers;
};

// Get marker priority based on type
export const getMarkerPriority = (type: MarkerData['type']): number => {
  switch (type) {
    case 'milestone': return 100;
    case 'conflict': return 80;
    case 'weather': return 60;
    case 'critical': return 40;
    default: return 0;
  }
};

// Get consistent marker colors
export const getMarkerColor = (type: MarkerData['type'], severity?: string): string => {
  switch (type) {
    case 'milestone': return 'bg-blue-500 border-blue-600';
    case 'conflict': 
      return severity === 'high' ? 'bg-red-500 border-red-600' :
             severity === 'medium' ? 'bg-orange-500 border-orange-600' :
             'bg-yellow-500 border-yellow-600';
    case 'weather':
      return severity === 'high' ? 'bg-red-500 border-red-600' :
             severity === 'moderate' ? 'bg-orange-500 border-orange-600' :
             'bg-yellow-500 border-yellow-600';
    case 'critical': return 'bg-red-200 border-red-400';
    default: return 'bg-gray-500 border-gray-600';
  }
};

// Check if marker is visible in current viewport
export const isMarkerVisible = (
  markerPosition: number,
  viewportStart: number,
  viewportEnd: number
): boolean => {
  return markerPosition >= viewportStart && markerPosition <= viewportEnd;
};

// Performance optimization: batch marker updates
export const batchMarkerUpdates = (
  markers: MarkerData[],
  timelineBounds: TimelineBounds
): MarkerData[] => {
  return markers.map(marker => ({
    ...marker,
    position: {
      x: calculateTimelinePosition(marker.date, timelineBounds),
      y: 0 // Will be adjusted by collision resolution
    },
    priority: getMarkerPriority(marker.type)
  }));
};
