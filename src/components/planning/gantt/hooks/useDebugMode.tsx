
import { useState, useEffect } from 'react';
import type { DebugPreferences, DebugModeHook } from '../types/ganttTypes';

export const useDebugMode = (): DebugModeHook => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Return proper structure immediately in production
  if (!isDevelopment) {
    return {
      isDebugMode: false,
      debugPreferences: {
        showColumnInfo: false,
        showTaskDetails: false,
        showGridLines: false,
        showPerformanceMetrics: false,
        showScrollInfo: false,
        showSubscriptions: false,
        showAuthState: false
      },
      toggleDebugMode: () => {},
      updateDebugPreference: () => {},
      isDevelopment: false
    };
  }

  // Only initialize debug state in development
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const [debugPreferences, setDebugPreferences] = useState<DebugPreferences>({
    showColumnInfo: false,
    showTaskDetails: true,
    showGridLines: false,
    showPerformanceMetrics: true,
    showScrollInfo: false,
    showSubscriptions: true,
    showAuthState: true
  });

  // Load debug preferences from localStorage only in development
  useEffect(() => {
    const saved = localStorage.getItem('gantt-debug-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDebugPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to parse debug preferences:', error);
        }
      }
    }
    
    const debugMode = localStorage.getItem('gantt-debug-mode') === 'true';
    setIsDebugMode(debugMode);
  }, []);

  const toggleDebugMode = (): void => {
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem('gantt-debug-mode', newMode.toString());
  };

  const updateDebugPreference = (key: keyof DebugPreferences, value: boolean): void => {
    const newPreferences = { ...debugPreferences, [key]: value };
    setDebugPreferences(newPreferences);
    localStorage.setItem('gantt-debug-preferences', JSON.stringify(newPreferences));
  };

  return {
    isDebugMode,
    debugPreferences,
    toggleDebugMode,
    updateDebugPreference,
    isDevelopment: true
  };
};
