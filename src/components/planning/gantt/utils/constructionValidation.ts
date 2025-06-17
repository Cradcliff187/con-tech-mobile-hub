
import { Task } from '@/types/database';
import { differenceInDays, isWeekend, addDays } from 'date-fns';

export interface DependencyViolation {
  id: string;
  type: 'phase_dependency' | 'inspection_required' | 'resource_conflict' | 'weather_constraint';
  severity: 'error' | 'warning' | 'info';
  message: string;
  affectedTaskIds: string[];
  suggestedDate?: Date;
}

export interface ConstructionConstraint {
  phaseOrder: string[];
  weatherSensitive: string[];
  inspectionRequired: string[];
  criticalPath: string[];
}

export interface TaskImpact {
  taskId: string;
  originalDate: Date;
  newDate: Date;
  impact: 'delayed' | 'accelerated' | 'unchanged';
  dependentTasks: string[];
}

const CONSTRUCTION_PHASES = {
  'foundation': 1,
  'framing': 2,
  'roofing': 3,
  'electrical': 4,
  'plumbing': 4,
  'hvac': 5,
  'insulation': 6,
  'drywall': 7,
  'flooring': 8,
  'paint': 9,
  'finish': 10
};

const WEATHER_SENSITIVE_CATEGORIES = [
  'roofing', 'siding', 'foundation', 'concrete', 'paint'
];

const INSPECTION_REQUIRED_PHASES = [
  'foundation', 'framing', 'electrical', 'plumbing', 'final'
];

export const validateConstructionMove = (
  task: Task,
  newStartDate: Date,
  allTasks: Task[]
): DependencyViolation[] => {
  const violations: DependencyViolation[] = [];
  
  // Phase dependency validation
  const phaseViolations = validatePhaseSequence(task, newStartDate, allTasks);
  violations.push(...phaseViolations);
  
  // Weather constraint validation
  const weatherViolations = validateWeatherConstraints(task, newStartDate);
  violations.push(...weatherViolations);
  
  // Inspection schedule validation
  const inspectionViolations = validateInspectionRequirements(task, newStartDate, allTasks);
  violations.push(...inspectionViolations);
  
  // Weekend/holiday validation
  const scheduleViolations = validateScheduleConstraints(task, newStartDate);
  violations.push(...scheduleViolations);
  
  return violations;
};

const validatePhaseSequence = (
  task: Task,
  newStartDate: Date,
  allTasks: Task[]
): DependencyViolation[] => {
  const violations: DependencyViolation[] = [];
  const taskPhase = getTaskPhase(task);
  
  if (!taskPhase) return violations;
  
  // Find prerequisite tasks
  const prerequisiteTasks = allTasks.filter(t => {
    const tPhase = getTaskPhase(t);
    return tPhase && CONSTRUCTION_PHASES[tPhase] < CONSTRUCTION_PHASES[taskPhase];
  });
  
  for (const prereqTask of prerequisiteTasks) {
    const prereqEndDate = prereqTask.due_date ? new Date(prereqTask.due_date) : null;
    if (prereqEndDate && newStartDate < prereqEndDate) {
      violations.push({
        id: `phase-${task.id}-${prereqTask.id}`,
        type: 'phase_dependency',
        severity: 'error',
        message: `${task.title} cannot start before ${prereqTask.title} is completed`,
        affectedTaskIds: [task.id, prereqTask.id],
        suggestedDate: addDays(prereqEndDate, 1)
      });
    }
  }
  
  return violations;
};

const validateWeatherConstraints = (
  task: Task,
  newStartDate: Date
): DependencyViolation[] => {
  const violations: DependencyViolation[] = [];
  const taskCategory = task.category?.toLowerCase() || '';
  
  if (WEATHER_SENSITIVE_CATEGORIES.some(cat => taskCategory.includes(cat))) {
    const month = newStartDate.getMonth();
    
    // Winter months (Dec, Jan, Feb) are problematic for outdoor work
    if ([11, 0, 1].includes(month)) {
      violations.push({
        id: `weather-${task.id}`,
        type: 'weather_constraint',
        severity: 'warning',
        message: `${task.title} is weather-sensitive and scheduled during winter months`,
        affectedTaskIds: [task.id]
      });
    }
    
    // Rainy season concerns (varies by region, assuming spring)
    if ([2, 3].includes(month) && taskCategory.includes('foundation')) {
      violations.push({
        id: `weather-foundation-${task.id}`,
        type: 'weather_constraint',
        severity: 'warning',
        message: `Foundation work during rainy season may cause delays`,
        affectedTaskIds: [task.id]
      });
    }
  }
  
  return violations;
};

const validateInspectionRequirements = (
  task: Task,
  newStartDate: Date,
  allTasks: Task[]
): DependencyViolation[] => {
  const violations: DependencyViolation[] = [];
  const taskCategory = task.category?.toLowerCase() || '';
  
  if (INSPECTION_REQUIRED_PHASES.some(phase => taskCategory.includes(phase))) {
    // Check if there's buffer time for inspection
    const taskDuration = task.estimated_hours ? Math.ceil(task.estimated_hours / 8) : 5;
    const endDate = addDays(newStartDate, taskDuration);
    
    // Require 1-2 days buffer for inspection scheduling
    const followingTasks = allTasks.filter(t => {
      const tStart = t.start_date ? new Date(t.start_date) : null;
      return tStart && tStart <= addDays(endDate, 2);
    });
    
    if (followingTasks.length > 0) {
      violations.push({
        id: `inspection-${task.id}`,
        type: 'inspection_required',
        severity: 'warning',
        message: `${task.title} requires inspection - allow 1-2 days buffer before next task`,
        affectedTaskIds: [task.id, ...followingTasks.map(t => t.id)]
      });
    }
  }
  
  return violations;
};

const validateScheduleConstraints = (
  task: Task,
  newStartDate: Date
): DependencyViolation[] => {
  const violations: DependencyViolation[] = [];
  
  // Check for weekend start
  if (isWeekend(newStartDate)) {
    const nextMonday = addDays(newStartDate, (8 - newStartDate.getDay()) % 7);
    violations.push({
      id: `weekend-${task.id}`,
      type: 'phase_dependency',
      severity: 'info',
      message: `Task scheduled to start on weekend, consider moving to ${nextMonday.toLocaleDateString()}`,
      affectedTaskIds: [task.id],
      suggestedDate: nextMonday
    });
  }
  
  return violations;
};

const getTaskPhase = (task: Task): keyof typeof CONSTRUCTION_PHASES | null => {
  const category = task.category?.toLowerCase() || '';
  
  for (const phase of Object.keys(CONSTRUCTION_PHASES)) {
    if (category.includes(phase)) {
      return phase as keyof typeof CONSTRUCTION_PHASES;
    }
  }
  
  return null;
};

export const calculateTaskImpact = (
  draggedTask: Task,
  newStartDate: Date,
  allTasks: Task[]
): TaskImpact[] => {
  const impacts: TaskImpact[] = [];
  const taskDuration = draggedTask.estimated_hours ? Math.ceil(draggedTask.estimated_hours / 8) : 5;
  const newEndDate = addDays(newStartDate, taskDuration);
  const originalStartDate = draggedTask.start_date ? new Date(draggedTask.start_date) : new Date();
  
  // Direct impact on dragged task
  impacts.push({
    taskId: draggedTask.id,
    originalDate: originalStartDate,
    newDate: newStartDate,
    impact: newStartDate > originalStartDate ? 'delayed' : 'accelerated',
    dependentTasks: []
  });
  
  // Find dependent tasks
  const dependentTasks = allTasks.filter(task => {
    // Simple dependency check - tasks that start after this one ends
    const taskStart = task.start_date ? new Date(task.start_date) : null;
    const originalEnd = draggedTask.due_date ? new Date(draggedTask.due_date) : null;
    
    return taskStart && originalEnd && taskStart <= addDays(originalEnd, 3);
  });
  
  // Calculate impact on dependent tasks
  dependentTasks.forEach(depTask => {
    const depOriginalStart = depTask.start_date ? new Date(depTask.start_date) : new Date();
    const daysDifference = differenceInDays(newEndDate, depOriginalStart);
    
    if (daysDifference > 0) {
      const newDepStart = addDays(newEndDate, 1);
      impacts.push({
        taskId: depTask.id,
        originalDate: depOriginalStart,
        newDate: newDepStart,
        impact: 'delayed',
        dependentTasks: []
      });
    }
  });
  
  return impacts;
};

export const getValidDropZones = (
  task: Task,
  timelineStart: Date,
  timelineEnd: Date,
  allTasks: Task[]
): { start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }[] => {
  const zones: { start: Date; end: Date; validity: 'valid' | 'warning' | 'invalid' }[] = [];
  const stepDays = 7; // Check weekly intervals
  
  for (let current = new Date(timelineStart); current <= timelineEnd; current = addDays(current, stepDays)) {
    const violations = validateConstructionMove(task, current, allTasks);
    const errorViolations = violations.filter(v => v.severity === 'error');
    const warningViolations = violations.filter(v => v.severity === 'warning');
    
    let validity: 'valid' | 'warning' | 'invalid' = 'valid';
    if (errorViolations.length > 0) validity = 'invalid';
    else if (warningViolations.length > 0) validity = 'warning';
    
    zones.push({
      start: current,
      end: addDays(current, stepDays - 1),
      validity
    });
  }
  
  return zones;
};
