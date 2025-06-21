
import { useState, useEffect } from 'react';
import type { DebugPreferences, DebugModeHook } from '../types/ganttTypes';

export const useDebugMode = (): DebugModeHook => {
  // Always return disabled state in production
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
};
