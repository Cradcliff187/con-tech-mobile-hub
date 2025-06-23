
import React, { useReducer, ReactNode, useEffect, useState } from 'react';
import { GanttContext } from './GanttContext';
import { GanttContextValue, GanttState } from './types';
import { ganttReducer, initialGanttState } from './reducer';
import { useGanttDataManager } from './dataManager';
import { useGanttContextMethods } from './contextMethods';

interface GanttProviderProps {
  children: ReactNode;
  initialState?: Partial<GanttState>;
  projectId?: string;
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ 
  children, 
  initialState,
  projectId
}) => {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    { ...initialGanttState(), ...initialState }
  );
  
  // Track initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Use data manager for task fetching and timeline calculations
  const { filteredTasks } = useGanttDataManager({ projectId, state, dispatch });

  // Get all context methods
  const contextMethods = useGanttContextMethods({ state, dispatch, filteredTasks });

  // Mark as initialized once we have the basic setup ready
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Don't render children until we're properly initialized
  if (!isInitialized) {
    return null; // This will prevent hook inconsistencies during mount
  }

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
