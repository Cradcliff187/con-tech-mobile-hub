
interface GanttStatusIndicatorsProps {
  criticalTasks: number;
  isDragging: boolean;
  currentValidity: 'valid' | 'warning' | 'invalid';
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
}

export const GanttStatusIndicators = ({
  criticalTasks,
  isDragging,
  currentValidity,
  showMiniMap,
  onToggleMiniMap
}: GanttStatusIndicatorsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <div className="flex items-center gap-2 text-red-600">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span>{criticalTasks} critical tasks</span>
      </div>
      <div className="flex items-center gap-2 text-orange-600">
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        <span>Resource conflicts detected</span>
      </div>
      {isDragging && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <span>Drag in progress - {currentValidity} move</span>
        </div>
      )}
      <button
        onClick={onToggleMiniMap}
        className="text-blue-600 hover:text-blue-800 underline text-sm"
      >
        {showMiniMap ? 'Hide' : 'Show'} Timeline Overview
      </button>
    </div>
  );
};
