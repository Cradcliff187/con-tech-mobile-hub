
import React, { useReducer, ReactNode, useEffect } from 'react';
import { GanttContext } from './GanttContext';
import { GanttContextValue, GanttState } from './types';
import { ganttReducer, initialGanttState } from './reducer';
import { useGanttDataManager } from './dataManager';
import { useGanttContextMethods } from './contextMethods';

interface GanttProviderProps {
  children: ReactNode;
  initialState?: Partial<GanttState>;
  projectId?: string;
  initialViewMode?: 'days' | 'weeks' | 'months';
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ 
  children, 
  initialState,
  projectId,
  initialViewMode
}) => {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    { 
      ...initialGanttState(), 
      ...initialState,
      ...(initialViewMode && { viewMode: initialViewMode })
    }
  );

  // Use data manager for task fetching and timeline calculations
  const { filteredTasks } = useGanttDataManager({ projectId, state, dispatch });

  // Get all context methods with stable dependencies and projectId
  const contextMethods = useGanttContextMethods({ 
    state, 
    dispatch, 
    filteredTasks, 
    projectId 
  });

  // Update view mode when external prop changes
  useEffect(() => {
    if (initialViewMode && initialViewMode !== state.viewMode) {
      contextMethods.setViewMode(initialViewMode);
    }
  }, [initialViewMode, state.viewMode, contextMethods.setViewMode]);

  const value: GanttContextValue = {
    state,
    dispatch,
    ...contextMethods
  };

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
};
