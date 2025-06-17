
import React, { useMemo } from 'react';
import { MarkerData } from '../utils/overlayUtils';
import { 
  detectAdvancedCollisions, 
  resolveCollisions,
  CollisionGroup 
} from '../utils/collisionUtils';
import { CompoundMarker } from './CompoundMarker';
import { MarkerCluster } from './MarkerCluster';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CollisionResolverProps {
  markers: MarkerData[];
  viewMode: 'days' | 'weeks' | 'months';
  isMobile?: boolean;
  showDebugInfo?: boolean;
}

export const CollisionResolver: React.FC<CollisionResolverProps> = ({
  markers,
  viewMode,
  isMobile = false,
  showDebugInfo = false
}) => {
  // Memoized collision detection and resolution
  const { resolvedMarkers, clusters, hiddenMarkers, collisionGroups } = useMemo(() => {
    if (markers.length === 0) {
      return { 
        resolvedMarkers: [], 
        clusters: [], 
        hiddenMarkers: [], 
        collisionGroups: [] 
      };
    }

    // Detect collisions
    const collisionGroups = detectAdvancedCollisions(markers, viewMode, isMobile);
    
    // Resolve collisions
    const { resolved, clusters, hidden } = resolveCollisions(collisionGroups, viewMode, isMobile);
    
    // Add non-colliding markers
    const nonCollidingMarkers = markers.filter(marker => 
      !collisionGroups.some(group => 
        group.markers.some(m => m.id === marker.id)
      )
    );

    return {
      resolvedMarkers: [...resolved, ...nonCollidingMarkers],
      clusters,
      hiddenMarkers: hidden,
      collisionGroups
    };
  }, [markers, viewMode, isMobile]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Resolved individual markers */}
      {resolvedMarkers.map(marker => {
        // Check if this is a compound marker by finding the collision group
        const compoundGroup = collisionGroups.find(group => 
          group.strategy === 'compound' && 
          group.markers.length > 1 &&
          group.markers.some(m => m.id === marker.id)
        );
        
        if (compoundGroup && marker.type === 'compound') {
          return (
            <CompoundMarker
              key={marker.id}
              markers={compoundGroup.markers}
              position={marker.position}
              isMobile={isMobile}
            />
          );
        }

        return (
          <Tooltip key={marker.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute pointer-events-auto"
                style={{
                  left: `${marker.position.x}%`,
                  top: `${marker.position.y}px`,
                  transform: 'translate(-50%, 0)'
                }}
              >
                <div className={`${isMobile ? 'w-8 h-8' : 'w-6 h-6'} rounded-full ${marker.color} shadow-sm border-2 border-white flex items-center justify-center transition-transform hover:scale-110`}>
                  {marker.icon}
                </div>
              </div>
            </TooltipTrigger>
            {marker.tooltip && (
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-800">{marker.tooltip.title}</div>
                  <div className="text-sm text-slate-600">{marker.tooltip.description}</div>
                  {marker.tooltip.details && (
                    <div className="text-xs text-slate-500 border-t pt-1">
                      {Object.entries(marker.tooltip.details).map(([key, value]) => (
                        <div key={key}>{key}: {String(value)}</div>
                      ))}
                    </div>
                  )}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        );
      })}

      {/* Marker clusters */}
      {clusters.map(cluster => (
        <MarkerCluster
          key={cluster.id}
          cluster={cluster}
          isMobile={isMobile}
        />
      ))}

      {/* Debug information */}
      {showDebugInfo && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs p-3 rounded pointer-events-auto max-w-xs">
          <div className="space-y-1">
            <div>Total markers: {markers.length}</div>
            <div>Collision groups: {collisionGroups.length}</div>
            <div>Resolved: {resolvedMarkers.length}</div>
            <div>Clustered: {clusters.length}</div>
            <div>Hidden: {hiddenMarkers.length}</div>
            <div>View mode: {viewMode}</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
