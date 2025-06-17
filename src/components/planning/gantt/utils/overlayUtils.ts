
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

export interface MarkerPosition {
  left: number;
  isVisible: boolean;
  snapPosition?: number;
  zone: keyof typeof MARKER_ZONES;
}

// Standardized marker layout zones with consistent positioning
export const MARKER_ZONES = {
  BACKGROUND: { zIndex: 10, top: 0, height: '100%' },
  PRIMARY: { zIndex: 40, top: 0, height: 'auto' },
  SECONDARY: { zIndex: 30, top: 8, height: 'auto' },
  TERTIARY: { zIndex: 20, top: 16, height: 'auto' },
  QUATERNARY: { zIndex: 15, top: 24, height: 'auto' }
} as const;

// Enhanced timeline bounds normalization
export const normalizeTimelineBounds = (
  timelineStart: Date,
  timelineEnd: Date
): TimelineBounds => {
  // Normalize to start of day in UTC to avoid timezone issues
  const start = new Date(timelineStart);
  start.setUTCHours(0, 0, 0, 0);
  
  const end = new Date(timelineEnd);
  end.setUTCHours(23, 59, 59, 999);
  
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  return { start, end, totalDays };
};

// Validate marker dates and handle edge cases
export const validateMarkerDate = (date: Date): { isValid: boolean; normalizedDate?: Date } => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid marker date provided:', date);
    return { isValid: false };
  }
  
  // Normalize to start of day in UTC
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(12, 0, 0, 0); // Use noon to avoid timezone edge cases
  
  return { isValid: true, normalizedDate };
};

// View mode specific snapping and positioning
export const getViewModeSnapping = (
  position: number,
  viewMode: 'days' | 'weeks' | 'months',
  totalDays: number
): number => {
  switch (viewMode) {
    case 'days':
      // Precise daily positioning - no snapping needed
      return position;
    case 'weeks':
      // Snap to week boundaries (7-day intervals)
      const weekSize = (7 / totalDays) * 100;
      return Math.round(position / weekSize) * weekSize;
    case 'months':
      // Snap to month boundaries (30-day intervals approximately)
      const monthSize = (30 / totalDays) * 100;
      return Math.round(position / monthSize) * monthSize;
    default:
      return position;
  }
};

// **MAIN: Standardized position calculation - Single source of truth**
export const getMarkerPosition = (
  date: Date,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months' = 'days'
): MarkerPosition => {
  // Step 1: Validate input date
  const validation = validateMarkerDate(date);
  if (!validation.isValid || !validation.normalizedDate) {
    console.warn('Invalid marker date, positioning at start:', date);
    return {
      left: 0,
      isVisible: false,
      zone: 'TERTIARY'
    };
  }

  // Step 2: Normalize timeline bounds
  const bounds = normalizeTimelineBounds(timelineStart, timelineEnd);
  
  // Step 3: Calculate raw position with mathematical precision
  const markerTime = validation.normalizedDate.getTime();
  const startTime = bounds.start.getTime();
  const endTime = bounds.end.getTime();
  
  // Check if marker is within timeline bounds
  const isVisible = markerTime >= startTime && markerTime <= endTime;
  
  // Calculate percentage position with boundary protection
  let rawPosition: number;
  if (markerTime < startTime) {
    rawPosition = -5; // Slightly off-screen left
  } else if (markerTime > endTime) {
    rawPosition = 105; // Slightly off-screen right
  } else {
    const totalTimeSpan = endTime - startTime;
    const markerOffset = markerTime - startTime;
    rawPosition = (markerOffset / totalTimeSpan) * 100;
  }
  
  // Step 4: Apply view mode snapping
  const snapPosition = getViewModeSnapping(rawPosition, viewMode, bounds.totalDays);
  
  // Step 5: Ensure position is within reasonable bounds (0-100%)
  const finalPosition = Math.max(0, Math.min(100, Math.round(snapPosition * 100) / 100));
  
  // Development mode logging
  if (process.env.NODE_ENV === 'development') {
    console.debug('Marker position calculation:', {
      date: validation.normalizedDate.toISOString(),
      rawPosition,
      snapPosition,
      finalPosition,
      viewMode,
      isVisible
    });
  }
  
  return {
    left: finalPosition,
    isVisible,
    snapPosition: rawPosition !== snapPosition ? snapPosition : undefined,
    zone: 'PRIMARY'
  };
};

// **ENHANCED: Standardized timeline position calculation for backward compatibility**
export const calculateTimelinePosition = (
  markerDate: Date,
  timelineBounds: TimelineBounds
): number => {
  const position = getMarkerPosition(
    markerDate,
    timelineBounds.start,
    timelineBounds.end,
    'days'
  );
  return position.left;
};

// Get marker vertical position based on type and zone
export const getMarkerVerticalPosition = (
  type: MarkerData['type'],
  collisionIndex: number = 0
): { top: number; zIndex: number; zone: keyof typeof MARKER_ZONES } => {
  let zone: keyof typeof MARKER_ZONES;
  
  // Assign zones based on marker type priority
  switch (type) {
    case 'milestone':
      zone = 'PRIMARY';
      break;
    case 'conflict':
      zone = 'SECONDARY';
      break;
    case 'weather':
      zone = 'TERTIARY';
      break;
    case 'critical':
      zone = 'BACKGROUND';
      break;
    default:
      zone = 'QUATERNARY';
  }
  
  const zoneConfig = MARKER_ZONES[zone];
  
  return {
    top: zoneConfig.top + (collisionIndex * 24), // 24px spacing for stacked markers
    zIndex: zoneConfig.zIndex,
    zone
  };
};

// Collision detection for markers at same position with enhanced tolerance
export const detectMarkerCollisions = (markers: MarkerData[]): MarkerData[][] => {
  const positionGroups = new Map<number, MarkerData[]>();
  const tolerance = 1.5; // 1.5% position tolerance for collision detection

  markers.forEach(marker => {
    const roundedPosition = Math.round(marker.position.x / tolerance) * tolerance;
    if (!positionGroups.has(roundedPosition)) {
      positionGroups.set(roundedPosition, []);
    }
    positionGroups.get(roundedPosition)!.push(marker);
  });

  return Array.from(positionGroups.values()).filter(group => group.length > 1);
};

// Smart spacing for overlapping markers with priority-based stacking
export const resolveMarkerCollisions = (markers: MarkerData[]): MarkerData[] => {
  const collisionGroups = detectMarkerCollisions(markers);
  const resolvedMarkers = [...markers];

  collisionGroups.forEach(group => {
    // Sort by priority (higher priority gets better positioning)
    group.sort((a, b) => b.priority - a.priority);
    
    group.forEach((marker, index) => {
      const markerIndex = resolvedMarkers.findIndex(m => m.id === marker.id);
      if (markerIndex !== -1) {
        const verticalPos = getMarkerVerticalPosition(marker.type, index);
        
        resolvedMarkers[markerIndex] = {
          ...marker,
          position: {
            ...marker.position,
            y: verticalPos.top
          }
        };
      }
    });
  });

  return resolvedMarkers;
};

// Get marker priority based on type with enhanced priority system
export const getMarkerPriority = (type: MarkerData['type']): number => {
  switch (type) {
    case 'milestone': return 100;
    case 'conflict': return 80;
    case 'weather': return 60;
    case 'critical': return 40;
    default: return 0;
  }
};

// Get consistent marker colors with enhanced color system
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

// Check if marker is visible in current viewport with enhanced visibility logic
export const isMarkerVisible = (
  markerPosition: number,
  viewportStart: number = 0,
  viewportEnd: number = 100,
  buffer: number = 5
): boolean => {
  return markerPosition >= (viewportStart - buffer) && markerPosition <= (viewportEnd + buffer);
};

// Performance optimization: batch marker updates with enhanced positioning
export const batchMarkerUpdates = (
  markers: MarkerData[],
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months' = 'days'
): MarkerData[] => {
  return markers.map(marker => {
    const position = getMarkerPosition(marker.date, timelineStart, timelineEnd, viewMode);
    const verticalPos = getMarkerVerticalPosition(marker.type);
    
    return {
      ...marker,
      position: {
        x: position.left,
        y: verticalPos.top
      },
      priority: getMarkerPriority(marker.type)
    };
  });
};

// Development helper: Create position debugging info
export const createPositionDebugInfo = (
  date: Date,
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
) => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const position = getMarkerPosition(date, timelineStart, timelineEnd, viewMode);
  const bounds = normalizeTimelineBounds(timelineStart, timelineEnd);
  
  return {
    inputDate: date.toISOString(),
    normalizedBounds: {
      start: bounds.start.toISOString(),
      end: bounds.end.toISOString(),
      totalDays: bounds.totalDays
    },
    calculatedPosition: position,
    viewMode
  };
};
