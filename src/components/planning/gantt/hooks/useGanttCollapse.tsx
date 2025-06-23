
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'gantt-collapsed-state';

export const useGanttCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const initialState = saved ? JSON.parse(saved) : false;
      console.log('🔄 Gantt Collapse: Initial state loaded from localStorage:', initialState);
      return initialState;
    } catch {
      console.log('🔄 Gantt Collapse: Failed to load from localStorage, using default (false)');
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
      console.log('💾 Gantt Collapse: State saved to localStorage:', isCollapsed);
    } catch {
      console.log('❌ Gantt Collapse: Failed to save to localStorage');
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    console.log('🔄 Gantt Collapse: Toggle called, current state:', isCollapsed);
    setIsCollapsed(prev => {
      const newState = !prev;
      console.log('🔄 Gantt Collapse: New state will be:', newState);
      return newState;
    });
  };

  return {
    isCollapsed,
    toggleCollapse
  };
};
