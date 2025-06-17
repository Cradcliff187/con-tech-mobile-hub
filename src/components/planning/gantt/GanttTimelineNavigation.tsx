
import { ChevronLeft, ChevronRight, Calendar, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    <div className="flex items-center gap-2 px-2 py-1 bg-white border-r border-slate-300">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onScrollLeft}
              disabled={!hasScrollLeft}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <ChevronLeft size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Scroll timeline left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onScrollRight}
              disabled={!hasScrollRight}
              className="h-8 w-8 p-0 hover:bg-slate-100"
            >
              <ChevronRight size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Scroll timeline right</TooltipContent>
        </Tooltip>
      </div>

      <div className="w-px h-6 bg-slate-300"></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoToToday}
            className="h-8 px-2 hover:bg-orange-50 hover:text-orange-600 text-xs font-medium"
          >
            <Calendar size={14} className="mr-1" />
            <span className="hidden sm:inline">Today</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Go to current date</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomToProject}
            className="h-8 px-2 hover:bg-blue-50 hover:text-blue-600 text-xs font-medium"
          >
            <ZoomIn size={14} className="mr-1" />
            <span className="hidden sm:inline">Fit</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Zoom to fit project timeline</TooltipContent>
      </Tooltip>

      <div className="text-xs text-slate-500 ml-2 hidden lg:block">
        {currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </div>
  );
};
