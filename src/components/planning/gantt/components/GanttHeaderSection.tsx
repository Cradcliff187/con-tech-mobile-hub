
import { GanttEnhancedHeader } from './GanttEnhancedHeader';
import { GanttStatusIndicators } from './GanttStatusIndicators';
import { GanttControls } from '../GanttControls';
import type { FilterState, FilterChangeHandler } from '../types/ganttTypes';

interface GanttHeaderSectionProps {
  totalDays: number;
  completedTasks: number;
  punchListTasks: number;
  localUpdatesCount: number;
  criticalTasks: number;
  isDragging: boolean;
  currentValidity: 'valid' | 'warning' | 'invalid';
  showMiniMap: boolean;
  onToggleMiniMap: () => void;
  onResetUpdates: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFilterChange: FilterChangeHandler;
  viewMode: 'days' | 'weeks' | 'months';
  onViewModeChange: (mode: 'days' | 'weeks' | 'months') => void;
  isDebugMode: boolean;
  onToggleDebugMode: () => void;
  isDevelopment: boolean;
}

export const GanttHeaderSection = ({
  totalDays,
  completedTasks,
  punchListTasks,
  localUpdatesCount,
  criticalTasks,
  isDragging,
  currentValidity,
  showMiniMap,
  onToggleMiniMap,
  onResetUpdates,
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  isDebugMode,
  onToggleDebugMode,
  isDevelopment
}: GanttHeaderSectionProps) => {
  return (
    <>
      <GanttEnhancedHeader
        totalDays={totalDays}
        completedTasks={completedTasks}
        punchListTasks={punchListTasks}
        localUpdatesCount={localUpdatesCount}
        onResetUpdates={onResetUpdates}
        tasks={[]}
      />

      <GanttStatusIndicators
        criticalTasks={criticalTasks}
        isDragging={isDragging}
        currentValidity={currentValidity}
        showMiniMap={showMiniMap}
        onToggleMiniMap={onToggleMiniMap}
      />

      <GanttControls
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        filters={filters}
        onFilterChange={onFilterChange}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        isDebugMode={isDebugMode}
        onToggleDebugMode={onToggleDebugMode}
        isDevelopment={isDevelopment}
      />
    </>
  );
};
