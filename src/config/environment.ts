
/**
 * Environment Configuration for Construction Management App
 * 
 * This configuration works with:
 * - Loveable's deployment system (using import.meta.env)
 * - Local development environments
 * - Vite build system
 */

interface EnvironmentConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    environment: string;
    isDevelopment: boolean;
    isProduction: boolean;
  };
  features: {
    debugMode: boolean;
    subscriptionStatusIndicator: boolean;
  };
}

// Validate required environment variables
const validateEnvironment = (): void => {
  const requiredVars = [
    { key: 'VITE_SUPABASE_URL', value: import.meta.env.VITE_SUPABASE_URL },
    { key: 'VITE_SUPABASE_ANON_KEY', value: import.meta.env.VITE_SUPABASE_ANON_KEY }
  ];

  const missingVars = requiredVars.filter(({ value }) => !value);
  
  if (missingVars.length > 0) {
    const missingKeys = missingVars.map(({ key }) => key).join(', ');
    throw new Error(
      `Missing required environment variables: ${missingKeys}\n\n` +
      'Please ensure these are configured:\n' +
      '- In Loveable: Project Settings > Environment Variables\n' +
      '- For local development: Create .env file with these variables'
    );
  }
};

// Validate environment on module load
validateEnvironment();

export const config: EnvironmentConfig = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  app: {
    name: 'ConstructPro',
    environment: import.meta.env.MODE || 'development',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
  },
  features: {
    debugMode: import.meta.env.MODE === 'development',
    subscriptionStatusIndicator: import.meta.env.MODE === 'development',
  }
};

// Helper functions for common environment checks
export const isDevelopment = (): boolean => config.app.isDevelopment;
export const isProduction = (): boolean => config.app.isProduction;
export const getEnvironment = (): string => config.app.environment;

// Debug logging for development
if (config.app.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    environment: config.app.environment,
    supabaseConfigured: !!(config.supabase.url && config.supabase.anonKey),
    debugMode: config.features.debugMode
  });
}
