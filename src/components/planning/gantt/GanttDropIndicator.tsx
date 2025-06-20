
import { formatDateRange } from './utils/dateUtils';

interface GanttDropIndicatorProps {
  isVisible: boolean;
  position: { x: number; y: number } | null;
  previewDate: Date | null;
  timelineRect: DOMRect | null;
}

export const GanttDropIndicator = ({ 
  isVisible, 
  position, 
  previewDate, 
  timelineRect 
}: GanttDropIndicatorProps) => {
  if (!isVisible || !position || !previewDate || !timelineRect) {
    return null;
  }

  const relativeX = position.x - timelineRect.left;
  const isValidDrop = relativeX >= 0 && relativeX <= timelineRect.width;
  
  return (
    <>
      {/* Drop indicator line */}
      <div
        className={`fixed top-0 bottom-0 w-0.5 z-50 pointer-events-none ${
          isValidDrop ? 'bg-blue-500' : 'bg-red-500'
        }`}
        style={{
          left: position.x
        }}
      />
      
      {/* Date preview tooltip */}
      <div
        className={`fixed z-50 px-3 py-2 rounded shadow-lg text-sm font-medium pointer-events-none ${
          isValidDrop 
            ? 'bg-blue-600 text-white' 
            : 'bg-red-600 text-white'
        }`}
        style={{
          left: position.x - 50,
          top: position.y - 40
        }}
      >
        {previewDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: previewDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        })}
      </div>
    </>
  );
};
