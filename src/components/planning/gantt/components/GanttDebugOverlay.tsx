
import React from 'react';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';

interface GanttDebugOverlayProps {
  isVisible: boolean;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttDebugOverlay = ({
  isVisible,
  timelineStart,
  timelineEnd,
  viewMode
}: GanttDebugOverlayProps) => {
  if (!isVisible) return null;

  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none bg-black bg-opacity-10">
      <div className="min-w-max flex h-full">
        {timelineUnits.map((unit, index) => (
          <div
            key={unit.key}
            className="flex-shrink-0 border-r border-red-500 border-opacity-70 h-full relative"
            style={{ width: `${columnWidth}px` }}
          >
            {/* Column index indicator */}
            <div className="absolute top-2 left-1 bg-red-500 text-white text-xs px-1 rounded">
              {index}
            </div>
            
            {/* Column width indicator */}
            <div className="absolute bottom-2 left-1 bg-blue-500 text-white text-xs px-1 rounded">
              {columnWidth}px
            </div>
            
            {/* Date indicator */}
            <div className="absolute top-8 left-1 bg-green-500 text-white text-xs px-1 rounded max-w-full overflow-hidden">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Debug info panel */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded">
        <h4 className="font-bold mb-2">Debug Info</h4>
        <div className="text-xs space-y-1">
          <div>View Mode: {viewMode}</div>
          <div>Units: {timelineUnits.length}</div>
          <div>Column Width: {columnWidth}px</div>
          <div>Start: {timelineStart.toLocaleDateString()}</div>
          <div>End: {timelineEnd.toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
};
