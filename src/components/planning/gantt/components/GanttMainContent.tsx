import { Task } from '@/types/database';
import { TimelineMiniMap } from '../navigation/TimelineMiniMap';
import { GanttStats } from '../GanttStats';
import { GanttProjectOverview } from '../GanttProjectOverview';
import { GanttChartContent } from '../GanttChartContent';
import { GanttDebugOverlay } from '../debug/GanttDebugOverlay';

interface GanttMainContentProps {
  showMiniMap: boolean;
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  currentViewStart: Date;
  currentViewEnd: Date;
  onViewportChange: (start: Date, end: Date) => void;
  selectedProject: any;
  completedTasks: number;
  totalTasks: number;
  onNavigateToDate: (date: Date) => void;
  viewMode: 'days' | 'weeks' | 'months';
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  isDragging: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId?: string;
  projectId: string;
  dragState: any;
  isDebugMode: boolean;
  debugPreferences: any;
  onUpdateDebugPreference: (key: string, value: boolean) => void;
  optimisticUpdatesCount?: number;
}

export const GanttMainContent = ({
  showMiniMap,
  displayTasks,
  timelineStart,
  timelineEnd,
  currentViewStart,
  currentViewEnd,
  onViewportChange,
  selectedProject,
  completedTasks,
  totalTasks,
  onNavigateToDate,
  viewMode,
  selectedTaskId,
  onTaskSelect,
  isDragging,
  timelineRef,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTaskId,
  projectId,
  dragState,
  isDebugMode,
  debugPreferences,
  onUpdateDebugPreference,
  optimisticUpdatesCount = 0
}: GanttMainContentProps) => {
  return (
    <>
      {/* Timeline Mini-map for navigation */}
      {showMiniMap && (
        <TimelineMiniMap
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          currentViewStart={currentViewStart}
          currentViewEnd={currentViewEnd}
          onViewportChange={onViewportChange}
        />
      )}

      {/* Summary Statistics */}
      <GanttStats tasks={displayTasks} />

      {/* Project Overview Timeline */}
      <GanttProjectOverview
        project={selectedProject}
        timelineStart={timelineStart}
        timelineEnd={timelineEnd}
        currentViewStart={currentViewStart}
        currentViewEnd={currentViewEnd}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        onNavigateToDate={onNavigateToDate}
        viewMode={viewMode}
      />

      {/* Enhanced Gantt Chart with Construction Features and Drag Integration */}
      <div className="relative">
        <GanttChartContent
          displayTasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          selectedTaskId={selectedTaskId}
          onTaskSelect={onTaskSelect}
          viewMode={viewMode}
          isDragging={isDragging}
          timelineRef={timelineRef}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          draggedTaskId={draggedTaskId}
          projectId={projectId}
          dragState={dragState}
        />

        {/* Enhanced Debug Overlay with Subscription Monitoring */}
        <GanttDebugOverlay
          isVisible={isDebugMode}
          tasks={displayTasks}
          timelineStart={timelineStart}
          timelineEnd={timelineEnd}
          viewMode={viewMode}
          debugPreferences={debugPreferences}
          onUpdatePreference={onUpdateDebugPreference}
          optimisticUpdatesCount={optimisticUpdatesCount}
          isDragging={isDragging}
        />
      </div>
    </>
  );
};
