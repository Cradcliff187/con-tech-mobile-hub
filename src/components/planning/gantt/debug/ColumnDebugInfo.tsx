
import React, { useState, useRef, useEffect } from 'react';
import { generateTimelineUnits } from '../utils/gridUtils';
import { getColumnWidth } from '../utils/gridUtils';

interface ColumnDebugInfoProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const ColumnDebugInfo: React.FC<ColumnDebugInfoProps> = ({
  timelineStart,
  timelineEnd,
  viewMode
}) => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Find the closest timeline element to calculate column
      const timelineElement = document.querySelector('[data-timeline-container]');
      if (timelineElement) {
        const rect = timelineElement.getBoundingClientRect();
        const relativeX = e.clientX - rect.left + timelineElement.scrollLeft;
        const columnIndex = Math.floor(relativeX / columnWidth);
        
        if (columnIndex >= 0 && columnIndex < timelineUnits.length) {
          setHoveredColumn(columnIndex);
        } else {
          setHoveredColumn(null);
        }
      }
    };

    const handleMouseLeave = () => {
      setHoveredColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [timelineUnits.length, columnWidth]);

  if (hoveredColumn === null || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const unit = timelineUnits[hoveredColumn];
  const unitDate = new Date(unit.key);

  return (
    <div
      className="absolute bg-blue-900/90 text-white text-xs p-2 rounded shadow-lg pointer-events-none z-60 min-w-48"
      style={{
        left: `${mousePosition.x + 10}px`,
        top: `${mousePosition.y - 60}px`,
        transform: mousePosition.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
      }}
    >
      <div className="space-y-1">
        <div className="font-semibold text-blue-200">Column Debug Info</div>
        <div className="flex justify-between">
          <span className="text-gray-300">Index:</span>
          <span className="font-mono">{hoveredColumn}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Date:</span>
          <span className="font-mono">{unit.label}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Full Date:</span>
          <span className="font-mono text-xs">{unitDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Width:</span>
          <span className="font-mono">{columnWidth}px</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Weekend:</span>
          <span className={unit.isWeekend ? 'text-orange-400' : 'text-green-400'}>
            {unit.isWeekend ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-300">Position:</span>
          <span className="font-mono">{hoveredColumn * columnWidth}px</span>
        </div>
      </div>
    </div>
  );
};
