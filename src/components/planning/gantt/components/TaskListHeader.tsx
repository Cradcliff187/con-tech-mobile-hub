
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskListHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  taskCount: number;
}

export const TaskListHeader = ({ isCollapsed, onToggleCollapse, taskCount }: TaskListHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-slate-700">Tasks ({taskCount})</h4>
        {isCollapsed && (
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
            Collapsed
          </span>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="h-6 w-6 p-0 hover:bg-slate-200"
        aria-label={isCollapsed ? "Expand task details" : "Collapse task details"}
        title={isCollapsed ? "Expand task details" : "Collapse task details"}
      >
        {isCollapsed ? (
          <ChevronDown size={14} className="text-slate-600" />
        ) : (
          <ChevronUp size={14} className="text-slate-600" />
        )}
      </Button>
    </div>
  );
};
