
import React from 'react';
import { AlertTriangle, Calendar, Cloud, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MarkerData } from '../utils/overlayUtils';

interface CompoundMarkerProps {
  markers: MarkerData[];
  position: { x: number; y: number };
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isMobile?: boolean;
}

export const CompoundMarker: React.FC<CompoundMarkerProps> = ({
  markers,
  position,
  isExpanded = false,
  onToggleExpand,
  isMobile = false
}) => {
  const primaryMarker = markers.reduce((prev, current) => 
    current.priority > prev.priority ? current : prev
  );

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Calendar size={8} className="text-blue-600" />;
      case 'conflict': return <AlertTriangle size={8} className="text-red-600" />;
      case 'weather': return <Cloud size={8} className="text-orange-600" />;
      default: return <Users size={8} className="text-slate-600" />;
    }
  };

  const getCompoundColor = () => {
    const hasHighPriority = markers.some(m => m.priority >= 80);
    const hasCritical = markers.some(m => m.type === 'conflict');
    
    if (hasCritical) return 'bg-red-500 border-red-600';
    if (hasHighPriority) return 'bg-orange-500 border-orange-600';
    return 'bg-blue-500 border-blue-600';
  };

  const markerSize = isMobile ? 'w-8 h-8' : 'w-6 h-6';
  const iconGrid = isMobile ? 'grid-cols-2 gap-0.5' : 'grid-cols-2 gap-0.5';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="absolute pointer-events-auto cursor-pointer transition-transform hover:scale-110"
          style={{
            left: `${position.x}%`,
            top: `${position.y}px`,
            transform: 'translate(-50%, 0)'
          }}
          onClick={onToggleExpand}
        >
          {/* Main compound marker */}
          <div className={`${markerSize} rounded-full ${getCompoundColor()} shadow-lg border-2 border-white relative overflow-hidden`}>
            {/* Icon grid for multiple indicators */}
            <div className={`absolute inset-0.5 grid ${iconGrid}`}>
              {markers.slice(0, 4).map((marker, index) => (
                <div
                  key={marker.id}
                  className="flex items-center justify-center bg-white/20 rounded-sm"
                >
                  {getMarkerIcon(marker.type)}
                </div>
              ))}
            </div>
            
            {/* Count badge for overflow */}
            {markers.length > 4 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {markers.length}
              </div>
            )}
          </div>

          {/* Expanded individual markers */}
          {isExpanded && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 space-y-2 z-50">
              {markers.map((marker, index) => (
                <div
                  key={marker.id}
                  className={`w-4 h-4 rounded-full ${marker.color} shadow-sm border border-white animate-in slide-in-from-top-2`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {marker.icon}
                </div>
              ))}
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-2">
          <div className="font-semibold text-slate-800">
            {markers.length} Indicators
          </div>
          <div className="space-y-1">
            {markers.map(marker => (
              <div key={marker.id} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${marker.color}`}></div>
                <span>{marker.tooltip?.title || marker.type}</span>
              </div>
            ))}
          </div>
          {onToggleExpand && (
            <div className="text-xs text-slate-500 border-t pt-1">
              Click to {isExpanded ? 'collapse' : 'expand'}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
