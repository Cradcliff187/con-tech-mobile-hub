import { Search, Filter, Calendar, Clock, BarChart3, Bug } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface GanttControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  };
  onFilterChange: (filterType: string, values: string[]) => void;
  viewMode: 'days' | 'weeks' | 'months';
  onViewModeChange: (mode: 'days' | 'weeks' | 'months') => void;
  // Debug mode props
  isDebugMode?: boolean;
  onToggleDebugMode?: () => void;
  isDevelopment?: boolean;
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
  
  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  const getViewModeIcon = (mode: 'days' | 'weeks' | 'months') => {
    switch (mode) {
      case 'days': return <Calendar size={16} />;
      case 'weeks': return <Clock size={16} />;
      case 'months': return <BarChart3 size={16} />;
    }
  };

  const getViewModeLabel = (mode: 'days' | 'weeks' | 'months') => {
    switch (mode) {
      case 'days': return 'Daily View';
      case 'weeks': return 'Weekly View';
      case 'months': return 'Monthly View';
    }
  };

  const getViewModeDescription = (mode: 'days' | 'weeks' | 'months') => {
    switch (mode) {
      case 'days': return 'Detailed daily timeline for precise planning';
      case 'weeks': return 'Weekly overview perfect for sprint planning';
      case 'months': return 'High-level monthly view for long-term planning';
    }
  };

  const statusOptions = ['not-started', 'in-progress', 'completed', 'blocked'];
  const priorityOptions = ['low', 'medium', 'high', 'critical'];
  const categoryOptions = ['Foundation', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Finish', 'Paint'];

  const handleFilterToggle = (filterType: string, value: string) => {
    const currentValues = filters[filterType as keyof typeof filters] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search tasks, categories, or assignees..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>
      </div>

      {/* Enhanced View Mode Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-600 hidden sm:block">View:</span>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {(['days', 'weeks', 'months'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                viewMode === mode 
                  ? 'bg-orange-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {getViewModeIcon(mode)}
                <span className="hidden sm:inline">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Debug Toggle - Development Only */}
      {isDevelopment && onToggleDebugMode && (
        <Button
          variant={isDebugMode ? "destructive" : "outline"}
          size="sm"
          onClick={onToggleDebugMode}
          className="relative min-h-[44px] touch-manipulation"
          title="Toggle debug overlay (Development only)"
        >
          <Bug size={16} className="mr-2" />
          <span className="hidden sm:inline">Debug</span>
          {isDebugMode && (
            <Badge 
              variant="secondary" 
              className="ml-2 px-1.5 py-0.5 text-xs bg-red-600 text-white hover:bg-red-700"
            >
              ON
            </Badge>
          )}
        </Button>
      )}

      {/* Enhanced Filters */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter size={16} className="mr-2" />
            <span className="hidden sm:inline">Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-2 px-1.5 py-0.5 text-xs bg-orange-600 hover:bg-orange-700"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-sm font-semibold">Filter Tasks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Status</DropdownMenuLabel>
          {statusOptions.map(status => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleFilterToggle('status', status)}
              className="flex items-center justify-between"
            >
              <span className="capitalize">{status.replace('-', ' ')}</span>
              {filters.status.includes(status) && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">✓</Badge>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Priority</DropdownMenuLabel>
          {priorityOptions.map(priority => (
            <DropdownMenuItem
              key={priority}
              onClick={() => handleFilterToggle('priority', priority)}
              className="flex items-center justify-between"
            >
              <span className="capitalize">{priority}</span>
              {filters.priority.includes(priority) && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">✓</Badge>
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-slate-500 font-normal">Category</DropdownMenuLabel>
          {categoryOptions.map(category => (
            <DropdownMenuItem
              key={category}
              onClick={() => handleFilterToggle('category', category)}
              className="flex items-center justify-between"
            >
              <span>{category}</span>
              {filters.category.some(cat => cat.toLowerCase().includes(category.toLowerCase())) && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">✓</Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Current View Mode Info */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-orange-600">
          {getViewModeIcon(viewMode)}
        </div>
        <div className="text-xs">
          <div className="font-semibold text-slate-700">{getViewModeLabel(viewMode)}</div>
          <div className="text-slate-500">{getViewModeDescription(viewMode)}</div>
        </div>
      </div>
    </div>
  );
};
