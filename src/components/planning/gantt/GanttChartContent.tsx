
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { GanttTimelineHeader } from './GanttTimelineHeader';
import { GanttTaskCard } from './GanttTaskCard';
import { GanttTimelineBar } from './GanttTimelineBar';
import { Task } from '@/types/database';

interface GanttChartContentProps {
  displayTasks: Task[];
  timelineStart: Date;
  timelineEnd: Date;
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
  viewMode: 'days' | 'weeks' | 'months';
  isDragging: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: () => void;
  draggedTaskId?: string;
}

export const GanttChartContent = ({
  displayTasks,
  timelineStart,
  timelineEnd,
  selectedTaskId,
  onTaskSelect,
  viewMode,
  isDragging,
  timelineRef,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  draggedTaskId
}: GanttChartContentProps) => {
  return (
    <Card className="border-slate-200 overflow-hidden">
      <GanttTimelineHeader 
        timelineStart={timelineStart} 
        timelineEnd={timelineEnd}
        viewMode={viewMode}
      />

      <div 
        ref={timelineRef}
        className={`max-h-[600px] overflow-y-auto ${
          isDragging ? 'timeline-drop-zone' : ''
        }`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {displayTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Calendar size={32} className="mx-auto mb-2 text-slate-400" />
            <p>No tasks match your search and filter criteria.</p>
            <p className="text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          displayTasks.map((task, index) => (
            <div key={task.id} className={`flex border-b border-slate-200 hover:bg-slate-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
              <GanttTaskCard 
                task={task} 
                isSelected={selectedTaskId === task.id}
                onSelect={onTaskSelect}
              />
              <GanttTimelineBar 
                task={task} 
                timelineStart={timelineStart} 
                timelineEnd={timelineEnd}
                isSelected={selectedTaskId === task.id}
                onSelect={onTaskSelect}
                viewMode={viewMode}
                isDragging={isDragging && draggedTaskId === task.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
