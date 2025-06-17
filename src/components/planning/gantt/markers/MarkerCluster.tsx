
import React, { useState } from 'react';
import { MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { MarkerData } from '../utils/overlayUtils';
import { CollisionGroup } from '../utils/collisionUtils';

interface MarkerClusterProps {
  cluster: CollisionGroup;
  isMobile?: boolean;
  maxVisibleMarkers?: number;
}

export const MarkerCluster: React.FC<MarkerClusterProps> = ({
  cluster,
  isMobile = false,
  maxVisibleMarkers = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const visibleMarkers = isExpanded 
    ? cluster.markers 
    : cluster.markers.slice(0, maxVisibleMarkers);
  
  const hiddenCount = cluster.markers.length - maxVisibleMarkers;
  const clusterSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'bg-red-500 border-red-600';
    if (priority >= 60) return 'bg-orange-500 border-orange-600';
    if (priority >= 40) return 'bg-yellow-500 border-yellow-600';
    return 'bg-blue-500 border-blue-600';
  };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${cluster.position.x}%`,
        top: `${cluster.position.y}px`,
        transform: 'translate(-50%, 0)'
      }}
    >
      {/* Main cluster indicator */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            {/* Primary cluster marker */}
            <div className={`${clusterSize} rounded-full ${getPriorityColor(cluster.priority)} shadow-lg border-2 border-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}>
              <MoreHorizontal size={isMobile ? 16 : 12} className="text-white" />
            </div>
            
            {/* Count badge */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-slate-800 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cluster.markers.length}
            </div>
            
            {/* Expand/collapse button */}
            {hiddenCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-8 left-1/2 transform -translate-x-1/2 h-6 px-2 text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={12} className="mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={12} className="mr-1" />
                    +{hiddenCount}
                  </>
                )}
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold text-slate-800">
              Marker Cluster ({cluster.markers.length} items)
            </div>
            <div className="text-sm text-slate-600">
              Multiple indicators at this timeline position
            </div>
            <div className="space-y-1">
              {cluster.markers.slice(0, 5).map(marker => (
                <div key={marker.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${marker.color}`}></div>
                  <span className="truncate">{marker.tooltip?.title || marker.type}</span>
                </div>
              ))}
              {cluster.markers.length > 5 && (
                <div className="text-xs text-slate-500">
                  +{cluster.markers.length - 5} more items
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Expanded marker list */}
      {isExpanded && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border p-3 z-50 min-w-48">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {cluster.markers.map((marker, index) => (
              <div
                key={marker.id}
                className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer animate-in slide-in-from-top-1"
                style={{ animationDelay: `${index * 25}ms` }}
              >
                <div className={`w-3 h-3 rounded-full ${marker.color} flex-shrink-0`}>
                  {marker.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-800 truncate">
                    {marker.tooltip?.title || marker.type}
                  </div>
                  {marker.tooltip?.description && (
                    <div className="text-xs text-slate-500 truncate">
                      {marker.tooltip.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-400 capitalize">
                  {marker.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
