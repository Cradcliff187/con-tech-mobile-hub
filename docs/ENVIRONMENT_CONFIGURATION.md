
# Environment Configuration Guide

## Overview

This construction management application uses a centralized environment configuration system that works with Loveable's deployment platform and local development environments.

## Required Environment Variables

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## Configuration in Loveable

1. **Access Project Settings**
   - Open your project in Loveable
   - Click on "Project Settings" in the top menu
   - Navigate to "Environment Variables"

2. **Add Required Variables**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Deploy Changes**
   - Click "Save" to apply environment variables
   - Redeploy your application for changes to take effect

## Local Development Setup

### Option 1: Using .env File (Recommended)
Create a `.env` file in your project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option 2: System Environment Variables
Set environment variables in your system:
```bash
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Environment Detection

The application automatically detects the current environment:

- **Development**: `import.meta.env.MODE === 'development'`
- **Production**: `import.meta.env.MODE === 'production'`

## Features by Environment

### Development Mode
- Subscription status indicator visible
- Debug logging enabled
- Enhanced error messages
- Development-specific UI elements

### Production Mode
- Optimized performance
- Minimal logging
- Production-ready error handling
- Clean user interface

## Configuration Access

Use the centralized config throughout your application:

```typescript
import { config, isDevelopment, isProduction } from '@/config/environment';

// Access Supabase configuration
const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Access feature flags
if (config.features.debugMode) {
  // Debug-specific code
}
```

## Troubleshooting

### Error: "Missing required environment variables"
**Cause**: Required environment variables are not set or accessible.

**Solutions**:
1. Verify variables are set in Loveable Project Settings
2. Check `.env` file exists and contains correct values
3. Ensure variable names start with `VITE_` prefix
4. Restart development server after adding variables

### Error: "Supabase configuration is incomplete"
**Cause**: Supabase credentials are missing or invalid.

**Solutions**:
1. Verify Supabase URL format: `https://your-project.supabase.co`
2. Check anon key is correct and not expired
3. Ensure variables are accessible at runtime
4. Test connection in Supabase dashboard

### Variables Not Loading in Development
**Cause**: Environment variables not properly loaded by Vite.

**Solutions**:
1. Ensure `.env` file is in project root
2. Restart development server (`npm run dev`)
3. Check variable names have `VITE_` prefix
4. Verify no syntax errors in `.env` file

### Deployment Issues in Loveable
**Cause**: Environment variables not configured in Loveable platform.

**Solutions**:
1. Access Project Settings > Environment Variables
2. Add all required variables with correct names
3. Save configuration and redeploy
4. Check deployment logs for configuration errors

## Security Best Practices

1. **Never commit sensitive keys**: Use `.env` files for local development only
2. **Use appropriate keys**: Only use public/anonymous keys in frontend code
3. **Validate configuration**: Application validates all required variables at startup
4. **Environment separation**: Use different Supabase projects for development/production

## Support

For additional help:
1. Check Loveable documentation: [https://docs.lovable.dev/](https://docs.lovable.dev/)
2. Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
3. Review application logs for specific error messages
