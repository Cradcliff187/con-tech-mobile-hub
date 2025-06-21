
// Minimal debug mode hook - always disabled in production
export const useDebugMode = () => {
  return {
    isDebugMode: false,
    isDevelopment: false
  };
};
