
import { useMemo } from 'react';
import { Task } from '@/types/database';
import { getTimelineBounds, TimelineBounds } from '../utils/coreGridSystem';

export const useTimelineCalculation = (
  tasks: Task[], 
  viewMode: 'days' | 'weeks' | 'months' = 'weeks'
): TimelineBounds => {
  return useMemo(() => {
    return getTimelineBounds(tasks, viewMode);
  }, [tasks, viewMode]);
};
