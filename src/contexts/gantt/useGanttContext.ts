
import { useContext } from 'react';
import { GanttContext } from './GanttContext';
import { GanttContextValue } from './types';

export const useGanttContext = (): GanttContextValue => {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider');
  }
  return context;
};
