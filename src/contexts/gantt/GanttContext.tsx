
import React, { createContext, useReducer, ReactNode } from 'react';
import { GanttContextValue, GanttState } from './types';
import { ganttReducer, initialGanttState } from './reducer';

export const GanttContext = createContext<GanttContextValue | undefined>(undefined);

interface GanttProviderProps {
  children: ReactNode;
  initialState?: Partial<GanttState>;
}

export const GanttProvider: React.FC<GanttProviderProps> = ({ 
  children, 
  initialState 
}) => {
  const [state, dispatch] = useReducer(
    ganttReducer, 
    { ...initialGanttState, ...initialState }
  );

  const value: GanttContextValue = {
    state,
    dispatch,
  };

  return (
    <GanttContext.Provider value={value}>
      {children}
    </GanttContext.Provider>
  );
};
