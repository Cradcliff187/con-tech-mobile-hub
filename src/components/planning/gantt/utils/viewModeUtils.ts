
export interface ViewModeConfig {
  height: string;
  topOffset: string;
  minWidth: string;
  fontSize: string;
  padding: string;
}

export const getViewModeConfig = (viewMode: 'days' | 'weeks' | 'months'): ViewModeConfig => {
  switch (viewMode) {
    case 'days':
      return {
        height: 'h-8',
        topOffset: 'top-2',
        minWidth: '32px',
        fontSize: 'text-xs',
        padding: 'px-2 py-1'
      };
    case 'weeks':
      return {
        height: 'h-6',
        topOffset: 'top-3',
        minWidth: '48px',
        fontSize: 'text-xs',
        padding: 'px-3 py-1'
      };
    case 'months':
      return {
        height: 'h-5',
        topOffset: 'top-3.5',
        minWidth: '64px',
        fontSize: 'text-xs',
        padding: 'px-4 py-1'
      };
  }
};

export const getBarHeight = (viewMode: 'days' | 'weeks' | 'months'): string => {
  switch (viewMode) {
    case 'days': return 'h-12';
    case 'weeks': return 'h-10';
    case 'months': return 'h-8';
  }
};

export const getTimelineHeaderHeight = (viewMode: 'days' | 'weeks' | 'months'): string => {
  switch (viewMode) {
    case 'days': return 'h-16';
    case 'weeks': return 'h-12';
    case 'months': return 'h-10';
  }
};
