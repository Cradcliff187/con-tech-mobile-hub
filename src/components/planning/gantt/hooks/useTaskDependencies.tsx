
import { useState, useCallback, useMemo } from 'react';
import { Task } from '@/types/database';
import { TaskDependency, DependencyType, DependencyValidationResult } from '../types/dependencyTypes';
import { calculateTaskDatesFromEstimate } from '../utils/dateUtils';

interface UseTaskDependenciesProps {
  tasks: Task[];
  dependencies: TaskDependency[];
  onDependencyCreate?: (predecessor: string, successor: string, type: DependencyType) => void;
  onDependencyDelete?: (dependencyId: string) => void;
}

export const useTaskDependencies = ({
  tasks,
  dependencies,
  onDependencyCreate,
  onDependencyDelete
}: UseTaskDependenciesProps) => {
  const [selectedDependency, setSelectedDependency] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<'create-dependency' | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);

  // Calculate task positions for dependency arrows
  const taskPositions = useMemo(() => {
    const positions = new Map<string, { start: Date; end: Date; x: number; y: number; width: number }>();
    
    tasks.forEach((task, index) => {
      const { calculatedStartDate, calculatedEndDate } = calculateTaskDatesFromEstimate(task);
      positions.set(task.id, {
        start: calculatedStartDate,
        end: calculatedEndDate,
        x: 0, // Will be calculated by timeline position
        y: index * 60 + 30, // Approximate row height
        width: 0 // Will be calculated by timeline width
      });
    });
    
    return positions;
  }, [tasks]);

  // Get dependencies for a specific task
  const getTaskDependencies = useCallback((taskId: string) => {
    return {
      predecessors: dependencies.filter(dep => dep.successor_id === taskId),
      successors: dependencies.filter(dep => dep.predecessor_id === taskId)
    };
  }, [dependencies]);

  // Validate dependency creation
  const validateDependency = useCallback((
    predecessorId: string, 
    successorId: string, 
    type: DependencyType = 'finish-to-start'
  ): DependencyValidationResult => {
    const conflicts: string[] = [];
    const suggestions: string[] = [];

    // Prevent self-dependency
    if (predecessorId === successorId) {
      conflicts.push('A task cannot depend on itself');
      return { isValid: false, conflicts, suggestions };
    }

    // Check for circular dependencies
    const wouldCreateCycle = checkForCircularDependency(predecessorId, successorId, dependencies);
    if (wouldCreateCycle) {
      conflicts.push('This dependency would create a circular dependency');
      suggestions.push('Consider breaking the dependency chain or using a different dependency type');
    }

    // Check for duplicate dependencies
    const isDuplicate = dependencies.some(dep => 
      dep.predecessor_id === predecessorId && 
      dep.successor_id === successorId &&
      dep.dependency_type === type
    );
    if (isDuplicate) {
      conflicts.push('This dependency already exists');
    }

    // Validate logical sequence
    const predecessor = tasks.find(t => t.id === predecessorId);
    const successor = tasks.find(t => t.id === successorId);
    
    if (predecessor && successor) {
      const predDates = calculateTaskDatesFromEstimate(predecessor);
      const succDates = calculateTaskDatesFromEstimate(successor);
      
      if (type === 'finish-to-start' && predDates.calculatedEndDate > succDates.calculatedStartDate) {
        suggestions.push('Consider adjusting task dates to respect the dependency sequence');
      }
    }

    return { 
      isValid: conflicts.length === 0, 
      conflicts, 
      suggestions 
    };
  }, [tasks, dependencies]);

  // Create new dependency
  const createDependency = useCallback((
    predecessorId: string, 
    successorId: string, 
    type: DependencyType = 'finish-to-start'
  ) => {
    const validation = validateDependency(predecessorId, successorId, type);
    
    if (!validation.isValid) {
      throw new Error(validation.conflicts.join(', '));
    }

    if (onDependencyCreate) {
      onDependencyCreate(predecessorId, successorId, type);
    }
  }, [validateDependency, onDependencyCreate]);

  // Delete dependency
  const deleteDependency = useCallback((dependencyId: string) => {
    if (onDependencyDelete) {
      onDependencyDelete(dependencyId);
    }
  }, [onDependencyDelete]);

  // Start dependency creation mode
  const startDependencyCreation = useCallback((sourceTaskId: string) => {
    setDragMode('create-dependency');
    setDragSource(sourceTaskId);
  }, []);

  // Complete dependency creation
  const completeDependencyCreation = useCallback((targetTaskId: string) => {
    if (dragSource && dragMode === 'create-dependency') {
      try {
        createDependency(dragSource, targetTaskId);
      } catch (error) {
        console.error('Failed to create dependency:', error);
        throw error;
      } finally {
        setDragMode(null);
        setDragSource(null);
      }
    }
  }, [dragSource, dragMode, createDependency]);

  // Cancel dependency creation
  const cancelDependencyCreation = useCallback(() => {
    setDragMode(null);
    setDragSource(null);
  }, []);

  return {
    // State
    selectedDependency,
    setSelectedDependency,
    dragMode,
    dragSource,
    taskPositions,
    
    // Methods
    getTaskDependencies,
    validateDependency,
    createDependency,
    deleteDependency,
    startDependencyCreation,
    completeDependencyCreation,
    cancelDependencyCreation,
  };
};

// Helper function to check for circular dependencies
function checkForCircularDependency(
  predecessorId: string, 
  successorId: string, 
  existingDependencies: TaskDependency[],
  visited = new Set<string>()
): boolean {
  if (visited.has(successorId)) {
    return true; // Circular dependency detected
  }

  visited.add(successorId);

  // Find all tasks that depend on the successor
  const dependentTasks = existingDependencies
    .filter(dep => dep.predecessor_id === successorId)
    .map(dep => dep.successor_id);

  // Check if any dependent task eventually leads back to the predecessor
  for (const dependentId of dependentTasks) {
    if (dependentId === predecessorId || 
        checkForCircularDependency(predecessorId, dependentId, existingDependencies, new Set(visited))) {
      return true;
    }
  }

  return false;
}
