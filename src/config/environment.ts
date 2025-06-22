
/**
 * Environment Configuration for Construction Management App
 * 
 * This configuration works with:
 * - Loveable's deployment system
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

// Use the actual Supabase project configuration from Loveable
const SUPABASE_URL = 'https://jjmedlilkxmrbacoitio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbWVkbGlsa3htcmJhY29pdGlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzAwNjIsImV4cCI6MjA2NTUwNjA2Mn0.xRHKmoJut_Yj9zMJArfoTVUDexN9SIzOqPSkKDURGfM';

export const config: EnvironmentConfig = {
  supabase: {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
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
