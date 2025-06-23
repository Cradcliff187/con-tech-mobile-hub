
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
        minWidth: '12px', // Reduced from 16px
        textLength: 20, // Reduced from 25
        fontSize: 'text-xs',
        height: 'h-5', // Reduced from h-6
        topOffset: 'top-3', // Adjusted for smaller container
        showText: true
      };
    case 'weeks':
      return {
        minWidth: '16px', // Reduced from 20px
        textLength: 15, // Reduced from 20
        fontSize: 'text-xs',
        height: 'h-6', // Reduced from h-8
        topOffset: 'top-2', // Adjusted for smaller container
        showText: true
      };
    case 'months':
      return {
        minWidth: '20px', // Reduced from 24px
        textLength: 12, // Reduced from 15
        fontSize: 'text-sm',
        height: 'h-8', // Reduced from h-10
        topOffset: 'top-1', // Adjusted for smaller container
        showText: true
      };
    default:
      return {
        minWidth: '16px', // Reduced from 20px
        textLength: 15, // Reduced from 20
        fontSize: 'text-xs',
        height: 'h-6', // Reduced from h-8
        topOffset: 'top-2', // Adjusted for smaller container
        showText: true
      };
  }
};

export const getBarHeight = (viewMode: 'days' | 'weeks' | 'months'): string => {
  switch (viewMode) {
    case 'days': return 'h-10'; // Reduced from h-12
    case 'weeks': return 'h-10'; // Reduced from h-12
    case 'months': return 'h-12'; // Reduced from h-16
    default: return 'h-10'; // Reduced from h-12
  }
};
