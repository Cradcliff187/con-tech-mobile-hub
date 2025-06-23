
export interface ViewModeConfig {
  minWidth: string;
  textLength: number;
  fontSize: string;
  height: string;
  topOffset: string;
  showText: boolean;
}

export const getViewModeConfig = (viewMode: 'days' | 'weeks' | 'months'): ViewModeConfig => {
  switch (viewMode) {
    case 'days':
      return {
        minWidth: '16px',
        textLength: 25,
        fontSize: 'text-xs',
        height: 'h-6', // Reduced from h-8
        topOffset: 'top-3', // Adjusted for smaller container
        showText: true
      };
    case 'weeks':
      return {
        minWidth: '20px',
        textLength: 20,
        fontSize: 'text-xs',
        height: 'h-8', // Reduced from h-10
        topOffset: 'top-2', // Adjusted for smaller container
        showText: true
      };
    case 'months':
      return {
        minWidth: '24px',
        textLength: 15,
        fontSize: 'text-sm',
        height: 'h-10', // Reduced from h-12
        topOffset: 'top-1', // Adjusted for smaller container
        showText: true
      };
    default:
      return {
        minWidth: '20px',
        textLength: 20,
        fontSize: 'text-xs',
        height: 'h-8', // Reduced from h-10
        topOffset: 'top-2', // Adjusted for smaller container
        showText: true
      };
  }
};

export const getBarHeight = (viewMode: 'days' | 'weeks' | 'months'): string => {
  switch (viewMode) {
    case 'days': return 'h-12'; // Reduced from h-16
    case 'weeks': return 'h-12'; // Reduced from h-16
    case 'months': return 'h-16'; // Reduced from h-20
    default: return 'h-12'; // Reduced from h-16
  }
};
