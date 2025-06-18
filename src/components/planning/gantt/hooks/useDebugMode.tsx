
import { useState, useEffect } from 'react';

interface DebugPreferences {
  showColumnInfo: boolean;
  showTaskDetails: boolean;
  showGridLines: boolean;
  showPerformanceMetrics: boolean;
  showScrollInfo: boolean;
  showSubscriptions: boolean;
  showAuthState: boolean;
}

export const useDebugMode = () => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugPreferences, setDebugPreferences] = useState<DebugPreferences>({
    showColumnInfo: false,
    showTaskDetails: true,
    showGridLines: false,
    showPerformanceMetrics: true,
    showScrollInfo: false,
    showSubscriptions: true, // Default to true for subscription monitoring
    showAuthState: true // Default to true for auth state monitoring
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Load debug preferences from localStorage
  useEffect(() => {
    if (isDevelopment) {
      const saved = localStorage.getItem('gantt-debug-preferences');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDebugPreferences(prev => ({ ...prev, ...parsed }));
        } catch (error) {
          console.warn('Failed to parse debug preferences:', error);
        }
      }
      
      const debugMode = localStorage.getItem('gantt-debug-mode') === 'true';
      setIsDebugMode(debugMode);
    }
  }, [isDevelopment]);

  const toggleDebugMode = () => {
    if (!isDevelopment) return;
    
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem('gantt-debug-mode', newMode.toString());
  };

  const updateDebugPreference = (key: keyof DebugPreferences, value: boolean) => {
    if (!isDevelopment) return;
    
    const newPreferences = { ...debugPreferences, [key]: value };
    setDebugPreferences(newPreferences);
    localStorage.setItem('gantt-debug-preferences', JSON.stringify(newPreferences));
  };

  return {
    isDebugMode: isDebugMode && isDevelopment,
    debugPreferences,
    toggleDebugMode,
    updateDebugPreference,
    isDevelopment
  };
};
