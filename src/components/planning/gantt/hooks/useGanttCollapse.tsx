
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gantt-collapsed-state';

export const useGanttCollapse = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [isCollapsed]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return {
    isCollapsed,
    toggleCollapse
  };
};
