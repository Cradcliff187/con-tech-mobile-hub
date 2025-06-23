
import { SearchInput } from './components/SearchInput';
import { FilterPopover } from './components/FilterPopover';
import { ViewModeSelector } from './components/ViewModeSelector';
import { DebugModeToggle } from './components/DebugModeToggle';
import type { FilterState, FilterChangeHandler } from './types/ganttTypes';

interface GanttControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFilterChange: FilterChangeHandler;
  viewMode: 'days' | 'weeks' | 'months';
  onViewModeChange: (mode: 'days' | 'weeks' | 'months') => void;
  isDebugMode?: boolean;
  onToggleDebugMode?: () => void;
  isDevelopment?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const GanttControls = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  isDebugMode = false,
  onToggleDebugMode,
  isDevelopment = false
}: GanttControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
        />

        <FilterPopover
          filters={filters}
          onFilterChange={onFilterChange}
        />
      </div>

      <div className="flex gap-3 items-center">
        <ViewModeSelector
          value={viewMode}
          onChange={onViewModeChange}
        />

        {isDevelopment && onToggleDebugMode && (
          <DebugModeToggle
            isActive={isDebugMode}
            onToggle={onToggleDebugMode}
          />
        )}
      </div>
    </div>
  );
};
