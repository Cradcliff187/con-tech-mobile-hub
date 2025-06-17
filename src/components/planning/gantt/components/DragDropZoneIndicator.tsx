
import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface DropZoneIndicatorProps {
  isVisible: boolean;
  position: { x: number; y: number };
  validity: 'valid' | 'warning' | 'invalid';
  violations?: string[];
  suggestedDate?: Date;
  className?: string;
}

export const DragDropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({
  isVisible,
  position,
  validity,
  violations = [],
  suggestedDate,
  className = ''
}) => {
  if (!isVisible) return null;

  const getValidityStyles = () => {
    switch (validity) {
      case 'valid':
        return {
          background: 'bg-green-500/20',
          border: 'border-green-500',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'warning':
        return {
          background: 'bg-yellow-500/20',
          border: 'border-yellow-500',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        };
      case 'invalid':
        return {
          background: 'bg-red-500/20',
          border: 'border-red-500',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        };
    }
  };

  const styles = getValidityStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`absolute pointer-events-none z-50 transition-all duration-200 ${className}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Main drop zone indicator */}
      <div className={`relative ${styles.background} ${styles.border} border-2 border-dashed rounded-lg p-4 min-w-48 shadow-lg backdrop-blur-sm`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={20} className={styles.iconColor} />
          <span className="font-semibold text-slate-800 capitalize">
            {validity === 'valid' ? 'Valid Drop Zone' : validity === 'warning' ? 'Caution Required' : 'Invalid Drop Zone'}
          </span>
        </div>

        {/* Violation messages */}
        {violations.length > 0 && (
          <div className="space-y-1 text-sm">
            {violations.slice(0, 3).map((violation, index) => (
              <div key={index} className="text-slate-700 flex items-start gap-1">
                <span className="text-xs mt-0.5">•</span>
                <span>{violation}</span>
              </div>
            ))}
            {violations.length > 3 && (
              <div className="text-xs text-slate-500 italic">
                +{violations.length - 3} more issues
              </div>
            )}
          </div>
        )}

        {/* Suggested date */}
        {suggestedDate && validity !== 'valid' && (
          <div className="mt-2 pt-2 border-t border-slate-300">
            <div className="text-xs text-slate-600">
              <span className="font-medium">Suggested: </span>
              {suggestedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        )}

        {/* Pulse animation for active drop zone */}
        <div className={`absolute inset-0 rounded-lg ${styles.border} border-2 border-dashed animate-pulse opacity-50`}></div>
      </div>

      {/* Drop zone highlight bars */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-60 transform -translate-y-1/2"></div>
    </div>
  );
};

interface DropZoneGridProps {
  zones: Array<{
    start: Date;
    end: Date;
    validity: 'valid' | 'warning' | 'invalid';
  }>;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  isVisible: boolean;
}

export const DropZoneGrid: React.FC<DropZoneGridProps> = ({
  zones,
  timelineStart,
  timelineEnd,
  viewMode,
  isVisible
}) => {
  if (!isVisible) return null;

  const getPositionPercentage = (date: Date) => {
    const totalTime = timelineEnd.getTime() - timelineStart.getTime();
    const elapsed = date.getTime() - timelineStart.getTime();
    return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {zones.map((zone, index) => {
        const startPos = getPositionPercentage(zone.start);
        const endPos = getPositionPercentage(zone.end);
        const width = endPos - startPos;

        const zoneStyles = {
          valid: 'bg-green-500/10 border-green-500/30',
          warning: 'bg-yellow-500/10 border-yellow-500/30',
          invalid: 'bg-red-500/10 border-red-500/30'
        };

        return (
          <div
            key={index}
            className={`absolute top-0 bottom-0 border-l border-r border-dashed transition-opacity duration-300 ${zoneStyles[zone.validity]}`}
            style={{
              left: `${startPos}%`,
              width: `${width}%`
            }}
          />
        );
      })}
    </div>
  );
};
