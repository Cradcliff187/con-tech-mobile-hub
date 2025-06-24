
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, ZoomIn } from 'lucide-react';

interface GanttTimelineNavigationProps {
  onGoToToday: () => void;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onZoomToProject: () => void;
  currentDate: Date;
  viewMode: 'days' | 'weeks' | 'months';
  hasScrollLeft: boolean;
  hasScrollRight: boolean;
}

export const GanttTimelineNavigation = ({
  onGoToToday,
  onScrollLeft,
  onScrollRight,
  onZoomToProject,
  currentDate,
  viewMode,
  hasScrollLeft,
  hasScrollRight
}: GanttTimelineNavigationProps) => {
  return (
    <div className="h-12 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onScrollLeft}
          disabled={!hasScrollLeft}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onScrollRight}
          disabled={!hasScrollRight}
          className="h-8 w-8 p-0"
        >
          <ChevronRight size={14} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onGoToToday}
          className="flex items-center gap-1 h-8"
        >
          <Calendar size={14} />
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomToProject}
          className="flex items-center gap-1 h-8"
        >
          <ZoomIn size={14} />
          Fit
        </Button>
      </div>
    </div>
  );
};
