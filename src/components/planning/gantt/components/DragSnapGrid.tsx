
import React from 'react';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';

interface DragSnapGridProps {
  isVisible: boolean;
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const DragSnapGrid = ({
  isVisible,
  timelineStart,
  timelineEnd,
  viewMode
}: DragSnapGridProps) => {
  if (!isVisible) return null;

  // Use consolidated timeline generation
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="min-w-max flex h-full">
        {timelineUnits.map((unit, index) => (
          <div
            key={unit.key}
            className="flex-shrink-0 border-r-2 border-blue-300 border-opacity-50 h-full animate-pulse"
            style={{ width: `${columnWidth}px` }}
          />
        ))}
      </div>
    </div>
  );
};
