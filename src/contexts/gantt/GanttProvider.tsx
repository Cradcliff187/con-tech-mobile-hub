
import React, { useReducer, ReactNode } from 'react';
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

  // Use data manager for task fetching and timeline calculations
  const { filteredTasks } = useGanttDataManager({ projectId, state, dispatch });

  // Get all context methods
  const contextMethods = useGanttContextMethods({ state, dispatch, filteredTasks });

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
