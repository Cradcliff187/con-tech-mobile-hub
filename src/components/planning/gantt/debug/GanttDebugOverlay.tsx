
import React, { useState } from 'react';
import { Task } from '@/types/database';
import { Settings, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ColumnDebugInfo } from './ColumnDebugInfo';
import { GridDebugLines } from './GridDebugLines';
import { PerformanceDebugPanel } from './PerformanceDebugPanel';

interface GanttDebugOverlayProps {
  isVisible: boolean;
  tasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  viewMode: 'days' | 'weeks' | 'months';
  debugPreferences: {
    showColumnInfo: boolean;
    showTaskDetails: boolean;
    showGridLines: boolean;
    showPerformanceMetrics: boolean;
    showScrollInfo: boolean;
  };
  onUpdatePreference: (key: string, value: boolean) => void;
  className?: string;
}

export const GanttDebugOverlay: React.FC<GanttDebugOverlayProps> = ({
  isVisible,
  tasks,
  timelineStart,
  timelineEnd,
  viewMode,
  debugPreferences,
  onUpdatePreference,
  className = ''
}) => {
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const togglePreference = (key: keyof typeof debugPreferences) => {
    onUpdatePreference(key, !debugPreferences[key]);
  };

  return (
    <div className={`absolute inset-0 pointer-events-none z-50 ${className}`}>
      {/* Grid Debug Lines */}
      {debugPreferences.showGridLines && (
        <GridDebugLines
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
      )}

      {/* Column Debug Info */}
      {debugPreferences.showColumnInfo && (
        <ColumnDebugInfo
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
        />
      )}

      {/* Mobile Debug Panel */}
      <div className="absolute bottom-4 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-80 pointer-events-auto">
        <div className="bg-black/90 text-white text-xs rounded-lg shadow-lg overflow-hidden">
          {/* Debug Header */}
          <div className="flex items-center justify-between p-3 bg-red-900/50 border-b border-red-800/50">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs px-2 py-1">
                DEBUG
              </Badge>
              <span className="font-medium">Gantt Debug Mode</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
              className="text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <Settings size={12} />
            </Button>
          </div>

          {/* Debug Settings */}
          <Collapsible open={isSettingsExpanded} onOpenChange={setIsSettingsExpanded}>
            <CollapsibleContent className="p-3 border-b border-gray-800">
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300 mb-2">Debug Overlays</div>
                {Object.entries(debugPreferences).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => togglePreference(key as keyof typeof debugPreferences)}
                    className="flex items-center justify-between w-full text-xs p-2 rounded hover:bg-white/10 transition-colors"
                  >
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                    {value ? <Eye size={12} className="text-green-400" /> : <EyeOff size={12} className="text-gray-500" />}
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Performance Metrics */}
          {debugPreferences.showPerformanceMetrics && (
            <PerformanceDebugPanel
              tasks={tasks}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              viewMode={viewMode}
            />
          )}

          {/* Basic Debug Info */}
          <div className="p-3 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">View Mode:</span>
              <span className="text-orange-400 font-medium">{viewMode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tasks:</span>
              <span>{tasks.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Timeline:</span>
              <span>{Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24))} days</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-800">
              Development mode only - not visible in production
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
