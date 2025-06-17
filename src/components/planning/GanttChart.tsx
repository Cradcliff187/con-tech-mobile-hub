import { useState, useEffect, useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from 'lucide-react';
import { Task } from '@/types/database';
import { GanttLoadingState } from './GanttLoadingState';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { GanttTimelineHeader } from './gantt/GanttTimelineHeader';
import { GanttTaskCard } from './gantt/GanttTaskCard';
import { GanttTimelineBar } from './gantt/GanttTimelineBar';
import { GanttLegend } from './gantt/GanttLegend';
import { GanttControls } from './gantt/GanttControls';
import { GanttStats } from './gantt/GanttStats';
import { GanttDropIndicator } from './gantt/GanttDropIndicator';
import { useDragAndDrop } from './gantt/useDragAndDrop';
import { getDaysBetween, getAssigneeName } from './gantt/ganttUtils';

interface GanttChartProps {
  projectId: string;
}

export const GanttChart = ({ projectId }: GanttChartProps) => {
  const { tasks, loading, error } = useTasks();
  const [timelineStart, setTimelineStart] = useState<Date>(new Date());
  const [timelineEnd, setTimelineEnd] = useState<Date>(new Date());
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineRect, setTimelineRect] = useState<DOMRect | null>(null);
  
  // Interactive state
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<{
    status: string[];
    priority: string[];
    category: string[];
    phase: string[];
  }>({
    status: [],
    priority: [],
    category: [],
    phase: []
  });
  const [viewMode, setViewMode] = useState<'days' | 'weeks' | 'months'>('weeks');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Drag and drop functionality
  const dragAndDrop = useDragAndDrop(timelineStart, timelineEnd, viewMode);

  // Filter tasks for the selected project
  useEffect(() => {
    const filtered = projectId && projectId !== 'all' 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    if (filtered.length > 0) {
      setProjectTasks(filtered);

      // Calculate timeline bounds using actual task dates
      const tasksWithDates = filtered.filter(task => task.start_date || task.due_date);
      
      if (tasksWithDates.length > 0) {
        const allDates = tasksWithDates.flatMap(task => [
          task.start_date ? new Date(task.start_date) : null,
          task.due_date ? new Date(task.due_date) : null
        ].filter(Boolean) as Date[]);
        
        if (allDates.length > 0) {
          const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
          
          // Add padding based on view mode
          const padding = viewMode === 'days' ? 3 : viewMode === 'weeks' ? 7 : 30;
          minDate.setDate(minDate.getDate() - padding);
          maxDate.setDate(maxDate.getDate() + padding);
          
          setTimelineStart(minDate);
          setTimelineEnd(maxDate);
        }
      }
    } else {
      setProjectTasks([]);
    }
  }, [tasks, projectId, viewMode]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...projectTasks];
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        getAssigneeName(task).toLowerCase().includes(query) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }
    
    // Apply filters (AND logic)
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status));
    }
    
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }
    
    if (filters.category.length > 0) {
      filtered = filtered.filter(task => 
        task.category && filters.category.some(cat => 
          task.category!.toLowerCase().includes(cat.toLowerCase())
        )
      );
    }
    
    // Phase filtering is complex since it's not directly stored on tasks
    // For now, we'll skip it but the infrastructure is there
    
    setFilteredTasks(filtered);
  }, [projectTasks, searchQuery, filters]);

  // Update timeline rect on resize or when timeline changes
  useEffect(() => {
    const updateTimelineRect = () => {
      if (timelineRef.current) {
        setTimelineRect(timelineRef.current.getBoundingClientRect());
      }
    };

    updateTimelineRect();
    window.addEventListener('resize', updateTimelineRect);
    return () => window.removeEventListener('resize', updateTimelineRect);
  }, [timelineStart, timelineEnd, filteredTasks]);

  // Get updated tasks with local changes
  const getDisplayTasks = () => {
    return filteredTasks.map(task => dragAndDrop.getUpdatedTask(task));
  };

  // Handle task selection
  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  // Handle loading state
  if (loading) {
    return <GanttLoadingState />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={48} className="mx-auto mb-4 text-red-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">Error Loading Tasks</h3>
        <p className="text-slate-500">{error.message}</p>
      </div>
    );
  }

  // Handle empty state with construction-specific messaging
  if (projectTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={48} className="mx-auto mb-4 text-slate-400" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No Construction Tasks Found</h3>
        <p className="text-slate-500">
          {projectId && projectId !== 'all' 
            ? 'Add construction tasks to this project to see the project timeline and dependencies.'
            : 'Create a construction project and add tasks to see the Gantt chart timeline.'
          }
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Tasks can include foundations, framing, electrical, plumbing, HVAC, and finishing work.
        </p>
      </div>
    );
  }

  const displayTasks = getDisplayTasks();
  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;
  const totalDays = getDaysBetween(timelineStart, timelineEnd);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-800">Construction Timeline</h3>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-orange-600" />
              <span>{totalDays} days</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>{completedTasks} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-purple-600" />
              <span>{displayTasks.filter(t => t.task_type === 'punch_list').length} punch list</span>
            </div>
            {Object.keys(dragAndDrop.localTaskUpdates).length > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <span className="text-xs bg-orange-100 px-2 py-1 rounded">
                  {Object.keys(dragAndDrop.localTaskUpdates).length} task(s) rescheduled
                </span>
                <button
                  onClick={dragAndDrop.resetLocalUpdates}
                  className="text-xs underline hover:no-underline"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Controls */}
        <GanttControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Summary Statistics */}
        <GanttStats tasks={displayTasks} />

        {/* Gantt Chart */}
        <Card className="border-slate-200 overflow-hidden">
          <GanttTimelineHeader timelineStart={timelineStart} timelineEnd={timelineEnd} />

          {/* Enhanced Tasks with Drag and Drop */}
          <div 
            ref={timelineRef}
            className={`max-h-[600px] overflow-y-auto ${
              dragAndDrop.isDragging ? 'timeline-drop-zone' : ''
            }`}
            onDragOver={dragAndDrop.handleDragOver}
            onDrop={dragAndDrop.handleDrop}
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
                    onSelect={handleTaskSelect}
                  />
                  <GanttTimelineBar 
                    task={task} 
                    timelineStart={timelineStart} 
                    timelineEnd={timelineEnd}
                    isSelected={selectedTaskId === task.id}
                    onSelect={handleTaskSelect}
                    viewMode={viewMode}
                    isDragging={dragAndDrop.isDragging && dragAndDrop.draggedTask?.id === task.id}
                    onDragStart={dragAndDrop.handleDragStart}
                    onDragEnd={dragAndDrop.handleDragEnd}
                  />
                </div>
              ))
            )}
          </div>
        </Card>

        <GanttLegend />

        {/* Drop Indicator */}
        <GanttDropIndicator
          isVisible={dragAndDrop.isDragging}
          position={dragAndDrop.dragPosition}
          previewDate={dragAndDrop.dropPreviewDate}
          timelineRect={timelineRect}
        />
      </div>
    </TooltipProvider>
  );
};
