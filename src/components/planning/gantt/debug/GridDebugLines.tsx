
import React from 'react';
import { generateTimelineUnits, getColumnWidth } from '../utils/gridUtils';

interface GridDebugLinesProps {
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GridDebugLines: React.FC<GridDebugLinesProps> = ({
  timelineStart,
  timelineEnd,
  viewMode
}) => {
  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div className="min-w-max flex h-full">
        {timelineUnits.map((unit, index) => {
          const isToday = new Date().toDateString() === new Date(unit.key).toDateString();
          const isWeekend = unit.isWeekend;
          
          return (
            <div
              key={unit.key}
              className={`flex-shrink-0 border-r-2 h-full relative ${
                isToday 
                  ? 'border-red-500 border-opacity-80' 
                  : isWeekend 
                    ? 'border-yellow-400 border-opacity-30'
                    : 'border-blue-400 border-opacity-20'
              }`}
              style={{ width: `${columnWidth}px` }}
            >
              {/* Column index indicator */}
              <div className={`absolute top-0 left-1 text-xs font-mono px-1 rounded-b ${
                isToday 
                  ? 'bg-red-500 text-white'
                  : isWeekend
                    ? 'bg-yellow-400 text-black'
                    : 'bg-blue-400 text-white'
              }`}>
                {index}
              </div>
              
              {/* Column width measurement */}
              <div className="absolute bottom-0 left-0 right-0 text-center">
                <div className="bg-black/70 text-white text-xs px-1 rounded-t font-mono">
                  {columnWidth}px
                </div>
              </div>

              {/* Date label for important columns */}
              {(index % 5 === 0 || isToday) && (
                <div className="absolute top-6 left-1 right-1">
                  <div className={`text-xs font-mono px-1 py-0.5 rounded truncate ${
                    isToday 
                      ? 'bg-red-500/80 text-white'
                      : 'bg-gray-800/80 text-white'
                  }`}>
                    {new Date(unit.key).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
