
import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Target, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/database';
import { format } from 'date-fns';

interface GanttProjectOverviewProps {
  project: Project | null;
  timelineStart: Date;
  timelineEnd: Date;
  currentViewStart: Date;
  currentViewEnd: Date;
  completedTasks: number;
  totalTasks: number;
  onNavigateToDate: (date: Date) => void;
  viewMode: 'days' | 'weeks' | 'months';
}

export const GanttProjectOverview = ({
  project,
  timelineStart,
  timelineEnd,
  currentViewStart,
  currentViewEnd,
  completedTasks,
  totalTasks,
  onNavigateToDate,
  viewMode
}: GanttProjectOverviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!project) return null;

  // Calculate progress percentage
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate timeline positions
  const totalTimespan = timelineEnd.getTime() - timelineStart.getTime();
  const currentViewPosition = ((currentViewStart.getTime() - timelineStart.getTime()) / totalTimespan) * 100;
  const currentViewWidth = ((currentViewEnd.getTime() - currentViewStart.getTime()) / totalTimespan) * 100;
  
  // Calculate today's position
  const today = new Date();
  const todayPosition = today >= timelineStart && today <= timelineEnd 
    ? ((today.getTime() - timelineStart.getTime()) / totalTimespan) * 100
    : null;

  // Navigation handlers
  const handleNavigateToStart = () => onNavigateToDate(timelineStart);
  const handleNavigateToToday = () => onNavigateToDate(new Date());
  const handleNavigateToEnd = () => onNavigateToDate(timelineEnd);

  // Timeline click handler
  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickPosition = (event.clientX - rect.left) / rect.width;
    const targetDate = new Date(timelineStart.getTime() + (clickPosition * totalTimespan));
    onNavigateToDate(targetDate);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Mobile: Collapsible Design */}
      <div className="block md:hidden">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors min-h-[44px]">
              <div className="flex items-center gap-3">
                <Target size={16} className="text-orange-600" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-slate-800 truncate max-w-32">
                    {project.name}
                  </h3>
                  <div className="text-xs text-slate-600">
                    {progressPercentage}% complete
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-slate-600">
                  {format(timelineStart, 'MMM d')} - {format(timelineEnd, 'MMM d')}
                </div>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="px-4 pb-4">
            <div className="space-y-3">
              {/* Mobile Timeline Bar */}
              <div 
                className="relative h-8 bg-slate-100 rounded cursor-pointer touch-pan-x"
                onClick={handleTimelineClick}
              >
                {/* Progress Fill */}
                <div 
                  className="absolute top-0 left-0 h-full bg-green-200 rounded transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
                
                {/* Current Viewport Indicator */}
                <div 
                  className="absolute top-0 h-full bg-blue-500 bg-opacity-30 border border-blue-500 rounded"
                  style={{ 
                    left: `${Math.max(0, currentViewPosition)}%`, 
                    width: `${Math.min(100 - Math.max(0, currentViewPosition), currentViewWidth)}%` 
                  }}
                />
                
                {/* Today Indicator */}
                {todayPosition !== null && (
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-red-500"
                    style={{ left: `${todayPosition}%` }}
                  />
                )}
              </div>
              
              {/* Quick Navigation */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleNavigateToStart} className="flex-1">
                  Start
                </Button>
                <Button variant="outline" size="sm" onClick={handleNavigateToToday} className="flex-1">
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNavigateToEnd} className="flex-1">
                  End
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop: Full Bar Design */}
      <div className="hidden md:block p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Target size={20} className="text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{project.name}</h3>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {format(timelineStart, 'MMM d, yyyy')} - {format(timelineEnd, 'MMM d, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {progressPercentage}% complete ({completedTasks}/{totalTasks} tasks)
                </span>
              </div>
            </div>
          </div>
          
          {/* Quick Navigation Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleNavigateToStart}>
              Project Start
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigateToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={handleNavigateToEnd}>
              Project End
            </Button>
          </div>
        </div>

        {/* Desktop Timeline Bar */}
        <div className="space-y-2">
          <div 
            className="relative h-16 bg-slate-100 rounded-lg cursor-pointer overflow-hidden hover:bg-slate-50 transition-colors"
            onClick={handleTimelineClick}
          >
            {/* Progress Fill */}
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-200 to-green-300 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* Grid Lines for Better Visual Reference */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className="flex-1 border-r border-slate-200 last:border-r-0"
                />
              ))}
            </div>
            
            {/* Current Viewport Indicator */}
            <div 
              className="absolute top-1 bottom-1 bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded flex items-center justify-center"
              style={{ 
                left: `${Math.max(0, currentViewPosition)}%`, 
                width: `${Math.min(100 - Math.max(0, currentViewPosition), currentViewWidth)}%` 
              }}
            >
              <span className="text-xs font-medium text-blue-700 bg-white bg-opacity-80 px-2 py-1 rounded">
                Current View
              </span>
            </div>
            
            {/* Today Indicator */}
            {todayPosition !== null && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-red-500 flex items-center justify-center"
                style={{ left: `${todayPosition}%` }}
              >
                <div className="absolute -top-2 bg-red-500 text-white text-xs px-1 rounded whitespace-nowrap">
                  Today
                </div>
              </div>
            )}
            
            {/* Start/End Date Labels */}
            <div className="absolute bottom-1 left-2 text-xs font-medium text-slate-700 bg-white bg-opacity-80 px-2 py-1 rounded">
              {format(timelineStart, 'MMM d')}
            </div>
            <div className="absolute bottom-1 right-2 text-xs font-medium text-slate-700 bg-white bg-opacity-80 px-2 py-1 rounded">
              {format(timelineEnd, 'MMM d')}
            </div>
          </div>
          
          {/* Additional Info Bar */}
          <div className="flex justify-between text-xs text-slate-500">
            <span>Click anywhere on the timeline to navigate</span>
            <span>Viewing: {viewMode} mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
