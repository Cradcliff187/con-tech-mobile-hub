
import React from 'react';
import { format } from 'date-fns';

interface DragPreviewIndicatorProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  previewDate: Date | null;
  validity: 'valid' | 'warning' | 'invalid';
  violationMessages: string[];
}

export const DragPreviewIndicator = ({
  isVisible,
  position,
  previewDate,
  validity,
  violationMessages
}: DragPreviewIndicatorProps) => {
  if (!isVisible || !position || !previewDate) return null;

  const getValidityColor = () => {
    switch (validity) {
      case 'valid': return 'bg-green-600 border-green-500';
      case 'warning': return 'bg-yellow-600 border-yellow-500';
      case 'invalid': return 'bg-red-600 border-red-500';
      default: return 'bg-blue-600 border-blue-500';
    }
  };

  return (
    <>
      {/* Drop line indicator */}
      <div
        className={`fixed top-0 bottom-0 w-0.5 z-50 pointer-events-none ${
          validity === 'valid' ? 'bg-green-500' : 
          validity === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ left: position.x }}
      />
      
      {/* Date preview tooltip */}
      <div
        className={`fixed z-50 px-3 py-2 rounded-md border shadow-lg text-sm font-medium pointer-events-none text-white ${getValidityColor()}`}
        style={{
          left: Math.max(10, position.x - 75),
          top: Math.max(10, position.y - 50)
        }}
      >
        <div className="text-center">
          {format(previewDate, 'MMM d, yyyy')}
        </div>
        {violationMessages.length > 0 && (
          <div className="text-xs mt-1 opacity-90">
            {violationMessages[0]}
          </div>
        )}
      </div>
    </>
  );
};
