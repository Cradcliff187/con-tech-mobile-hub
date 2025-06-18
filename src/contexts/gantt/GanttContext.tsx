
import { createContext } from 'react';
import { GanttContextValue } from './types';

export const GanttContext = createContext<GanttContextValue | undefined>(undefined);
