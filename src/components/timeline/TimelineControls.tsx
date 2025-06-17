
import React from 'react';

interface TimelineControlsProps {
  selectedTimeRange: 'week' | 'month' | 'quarter';
  onTimeRangeChange: (range: 'week' | 'month' | 'quarter') => void;
  taskCount: number;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  selectedTimeRange,
  onTimeRangeChange,
  taskCount
}) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-800">
        Project Timeline
        <span className="text-sm font-normal text-slate-600 ml-2">
          ({taskCount} task{taskCount !== 1 ? 's' : ''})
        </span>
      </h3>
      <div className="flex gap-2">
        {(['week', 'month', 'quarter'] as const).map((range) => (
          <button
            key={range}
            onClick={() => onTimeRangeChange(range)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedTimeRange === range
                ? 'bg-orange-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};
