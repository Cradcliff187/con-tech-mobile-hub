
import { Task } from '@/types/database';
import { generateTimelineUnits, getTaskGridPosition, getColumnWidth } from './gridUtils';
import { calculateTaskDatesFromEstimate } from './dateUtils';

interface ViewModeValidationResult {
  isValid: boolean;
  issues: string[];
  stats: {
    totalTasks: number;
    tasksWithIssues: number;
    averageColumnSpan: number;
    averageStartColumn: number;
  };
}

export const validateViewMode = (
  tasks: Task[],
  timelineStart: Date,
  timelineEnd: Date,
  viewMode: 'days' | 'weeks' | 'months'
): ViewModeValidationResult => {
  const issues: string[] = [];
  let tasksWithIssues = 0;
  let totalColumnSpan = 0;
  let totalStartColumn = 0;

  const timelineUnits = generateTimelineUnits(timelineStart, timelineEnd, viewMode);
  const columnWidth = getColumnWidth(viewMode);

  if (timelineUnits.length === 0) {
    issues.push('No timeline units generated');
    return {
      isValid: false,
      issues,
      stats: { totalTasks: 0, tasksWithIssues: 0, averageColumnSpan: 0, averageStartColumn: 0 }
    };
  }

  tasks.forEach((task) => {
    const taskIssues: string[] = [];
    
    try {
      const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      
      if (calculatedStartDate >= calculatedEndDate) {
        taskIssues.push(`Invalid date range: start >= end`);
      }

      const gridPosition = getTaskGridPosition(task, timelineStart, timelineEnd, viewMode);
      
      if (gridPosition.startColumnIndex < 0) {
        taskIssues.push(`Negative start column: ${gridPosition.startColumnIndex}`);
      }
      
      if (gridPosition.columnSpan <= 0) {
        taskIssues.push(`Invalid column span: ${gridPosition.columnSpan}`);
      }
      
      if (gridPosition.startColumnIndex >= timelineUnits.length) {
        taskIssues.push(`Start column beyond timeline: ${gridPosition.startColumnIndex} >= ${timelineUnits.length}`);
      }

      const taskWidth = gridPosition.columnSpan * columnWidth;
      if (taskWidth <= 0) {
        taskIssues.push(`Invalid task width: ${taskWidth}px`);
      }

      totalColumnSpan += gridPosition.columnSpan;
      totalStartColumn += gridPosition.startColumnIndex;

    } catch (error) {
      taskIssues.push(`Grid calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (taskIssues.length > 0) {
      tasksWithIssues++;
      issues.push(`Task "${task.title.slice(0, 30)}...": ${taskIssues.join(', ')}`);
    }
  });

  const firstUnit = timelineUnits[0];
  const lastUnit = timelineUnits[timelineUnits.length - 1];
  
  if (new Date(firstUnit.key) > timelineStart) {
    issues.push(`First timeline unit (${new Date(firstUnit.key).toISOString()}) is after timeline start (${timelineStart.toISOString()})`);
  }
  
  if (new Date(lastUnit.key) < timelineEnd) {
    issues.push(`Last timeline unit (${new Date(lastUnit.key).toISOString()}) is before timeline end (${timelineEnd.toISOString()})`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      totalTasks: tasks.length,
      tasksWithIssues,
      averageColumnSpan: tasks.length > 0 ? totalColumnSpan / tasks.length : 0,
      averageStartColumn: tasks.length > 0 ? totalStartColumn / tasks.length : 0
    }
  };
};

// Simplified validation hook for development only
export const useViewModeValidation = (
  tasks: Task[],
  timelineStart: Date,
  timelineEnd: Date,
  currentViewMode: 'days' | 'weeks' | 'months'
) => {
  if (process.env.NODE_ENV !== 'development') {
    return { isValid: true, issues: [], stats: { totalTasks: 0, tasksWithIssues: 0, averageColumnSpan: 0, averageStartColumn: 0 } };
  }

  return validateViewMode(tasks, timelineStart, timelineEnd, currentViewMode);
};
