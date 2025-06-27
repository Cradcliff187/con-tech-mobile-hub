
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GanttUndoRedoControls } from './GanttUndoRedoControls';
import { Task } from '@/types/database';

interface GanttHeaderProps {
  canUndo: boolean;
  canRedo: boolean;
  isPerformingAction: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory: () => void;
  undoDescription: string;
  redoDescription: string;
  historyLength: number;
  isSystemBusy: boolean;
  displayTasks: Task[];
  onCollapseAll: () => void;
  onExpandAll: () => void;
}

export const GanttHeader = ({
  canUndo,
  canRedo,
  isPerformingAction,
  onUndo,
  onRedo,
  onClearHistory,
  undoDescription,
  redoDescription,
  historyLength,
  isSystemBusy,
  displayTasks,
  onCollapseAll,
  onExpandAll
}: GanttHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-4">
        <h3 className="text-sm font-medium text-slate-700">
          Gantt Chart
        </h3>
        <GanttUndoRedoControls
          canUndo={canUndo}
          canRedo={canRedo}
          isPerformingAction={isPerformingAction}
          onUndo={onUndo}
          onRedo={onRedo}
          onClearHistory={onClearHistory}
          undoDescription={undoDescription}
          redoDescription={redoDescription}
          historyLength={historyLength}
        />
        
        {/* Collapse/Expand Controls */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapseAll}
            disabled={isSystemBusy}
            className="h-8 px-2 text-xs"
          >
            <ChevronRight className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExpandAll}
            disabled={isSystemBusy}
            className="h-8 px-2 text-xs"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Expand All
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-slate-600">
        {isSystemBusy && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span>
              {isPerformingAction ? 'Processing...' : 'Updating...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
