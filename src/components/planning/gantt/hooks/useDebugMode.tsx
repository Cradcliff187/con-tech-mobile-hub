
import { useState, useEffect } from 'react';

const DEBUG_MODE_KEY = 'gantt-debug-mode';

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugPreferences, setDebugPreferences] = useState({
    showColumnInfo: true,
    showTaskDetails: true,
    showGridLines: true,
    showPerformanceMetrics: true,
    showScrollInfo: true
  });

  // Initialize debug mode from localStorage on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const savedDebugMode = localStorage.getItem(DEBUG_MODE_KEY);
      if (savedDebugMode) {
        setIsDebugMode(JSON.parse(savedDebugMode));
      }
    }
  }, []);

  // Save debug mode to localStorage when it changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem(DEBUG_MODE_KEY, JSON.stringify(isDebugMode));
    }
  }, [isDebugMode]);

  const toggleDebugMode = () => {
    if (process.env.NODE_ENV === 'development') {
      setIsDebugMode(!isDebugMode);
    }
  };

  const updateDebugPreference = (key: keyof typeof debugPreferences, value: boolean) => {
    setDebugPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Only expose debug functionality in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    isDebugMode: isDevelopment && isDebugMode,
    debugPreferences,
    toggleDebugMode,
    updateDebugPreference,
    isDevelopment
  };
};
