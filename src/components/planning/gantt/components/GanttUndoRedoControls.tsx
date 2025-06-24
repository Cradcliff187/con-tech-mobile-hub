
import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GanttUndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  isPerformingAction: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearHistory: () => void;
  undoDescription?: string | null;
  redoDescription?: string | null;
  historyLength: number;
}

export const GanttUndoRedoControls = ({
  canUndo,
  canRedo,
  isPerformingAction,
  onUndo,
  onRedo,
  onClearHistory,
  undoDescription,
  redoDescription,
  historyLength
}: GanttUndoRedoControlsProps) => {
  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPerformingAction) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) onUndo();
      } else if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
                 ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, isPerformingAction, onUndo, onRedo]);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border-r border-slate-200 pr-3 mr-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo || isPerformingAction}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">
                {canUndo ? 'Undo' : 'No actions to undo'}
              </div>
              {undoDescription && (
                <div className="text-xs text-slate-500 mt-1">
                  {undoDescription}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                Ctrl+Z
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo || isPerformingAction}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">
                {canRedo ? 'Redo' : 'No actions to redo'}
              </div>
              {redoDescription && (
                <div className="text-xs text-slate-500 mt-1">
                  {redoDescription}
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                Ctrl+Y
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {historyLength > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearHistory}
                disabled={isPerformingAction}
                className="h-8 w-8 p-0 hover:bg-slate-100 ml-1"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-medium">Clear History</div>
                <div className="text-xs text-slate-500 mt-1">
                  {historyLength} action{historyLength !== 1 ? 's' : ''} in history
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}

        {isPerformingAction && (
          <div className="ml-2 flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
