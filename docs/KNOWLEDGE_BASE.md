
# Construction Project Management - Knowledge Base

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Navigation Patterns](#navigation-patterns)
3. [Permission System](#permission-system)
4. [Responsive Design Guidelines](#responsive-design-guidelines)
5. [Component Library](#component-library)
6. [Database Schema](#database-schema)
7. [API Integration](#api-integration)
8. [Troubleshooting](#troubleshooting)

## System Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RPC)
- **UI Components**: shadcn/ui
- **State Management**: React Query (@tanstack/react-query)
- **Routing**: React Router DOM

### Core Technologies
```typescript
// Authentication Hooks
useAuth() // Company user authentication
useAdminAuth() // Admin-specific authentication

// Database Integration
supabase // Configured Supabase client
```

## Navigation Patterns

### URL Structure
The application uses searchParams-based navigation with context preservation:

```
/?section=<section>&project=<project_id>
```

### Available Sections
- `dashboard` - Main project overview
- `projects` - Project management
- `tasks` - Task management and Gantt charts
- `stakeholders` - Stakeholder directory and assignments
- `resources` - Equipment and resource allocation
- `documents` - Document management
- `communication` - Project communication hub
- `reports` - Analytics and reporting

### Context Preservation
Navigation maintains:
- Current project context
- Active filters
- User preferences
- View modes

## Permission System

### User Roles

#### Company Users (is_company_user = true)
- **admin**: Full system access
- **project_manager**: Project and stakeholder management
- **site_supervisor**: Task supervision and updates
- **worker**: Basic task updates

#### External Users (is_company_user = false)
- **stakeholder**: External contractors/employees
- **client**: Project visibility and progress tracking
- **vendor**: Delivery and supply management

### Permission Requirements
All users must have:
- `account_status = 'approved'`
- Valid authentication session

### Permission Checks
```typescript
// Example permission patterns
is_company_user && account_status === 'approved' // Basic company access
role === 'admin' && is_company_user // Admin access
role IN ('admin', 'project_manager') && is_company_user // Management access
```

## Responsive Design Guidelines

### Mobile-First Approach
- Design for mobile screens first (320px+)
- Progressive enhancement for larger screens
- Touch-friendly interactive elements (min 44px)

### Breakpoints
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Large desktops */
2xl: 1536px /* Extra large screens */
```

### Construction Color Scheme
```css
/* Primary Colors */
--slate: slate-500, slate-600, slate-700
--blue: blue-500, blue-600, blue-700  
--orange: orange-500, orange-600, orange-700

/* Status Colors */
--green: green-500 (completed, approved)
--yellow: yellow-500 (pending, in-progress)
--red: red-500 (error, critical)
--purple: purple-500 (punch list, inspection)
```

## Component Library

### Core Components

#### Navigation Components
- `DesktopSidebar` - Desktop navigation
- `MobileNavigation` - Mobile-responsive navigation
- `Breadcrumbs` - Context navigation
- `EnhancedSidebarTrigger` - Mobile menu trigger

#### Project Components
- `ProjectCard` - Project overview cards
- `ProjectStatusDisplay` - Status with lifecycle badges
- `ProjectQuickActions` - Quick action buttons
- `CreateProjectDialog` - Project creation modal

#### Task Management
- `TaskManager` - Main task interface
- `GanttChart` - Timeline visualization
- `TaskItem` - Individual task display
- `CreateTaskDialog` - Task creation modal

#### Stakeholder Management
- `StakeholderDirectory` - Stakeholder listing
- `StakeholderCard` - Individual stakeholder display
- `StakeholderAssignments` - Assignment management
- `CreateStakeholderDialog` - Stakeholder creation

#### Status Management
- `EnhancedUnifiedStatusBadge` - Status display
- `UnifiedStatusDropdown` - Status selection
- `EnhancedStatusTransitionDialog` - Status change confirmation

### Common Patterns

#### Responsive Dialogs
```typescript
import { ResponsiveDialog } from './ResponsiveDialog';

<ResponsiveDialog 
  open={open} 
  onOpenChange={setOpen}
  title="Dialog Title"
  className="max-w-lg"
>
  Content
</ResponsiveDialog>
```

#### Touch-Friendly Buttons
```typescript
import { TouchFriendlyButton } from './TouchFriendlyButton';

<TouchFriendlyButton 
  variant="primary" 
  size="lg"
  className="min-h-[44px]"
>
  Action
</TouchFriendlyButton>
```

## Database Schema

### Core Tables

#### Projects
```sql
projects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  status project_status DEFAULT 'planning',
  phase TEXT DEFAULT 'planning',
  unified_lifecycle_status project_lifecycle_status,
  progress INTEGER DEFAULT 0,
  budget NUMERIC,
  spent NUMERIC DEFAULT 0,
  -- Address fields
  street_address TEXT,
  city TEXT, 
  state VARCHAR,
  zip_code VARCHAR,
  -- Relationships
  client_id UUID REFERENCES stakeholders(id),
  project_manager_id UUID REFERENCES profiles(id)
)
```

#### Stakeholders
```sql
stakeholders (
  id UUID PRIMARY KEY,
  stakeholder_type stakeholder_type NOT NULL,
  contact_person TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT,
  status stakeholder_status DEFAULT 'active',
  -- Address fields
  street_address TEXT,
  city TEXT,
  state VARCHAR,
  zip_code VARCHAR
)
```

#### Tasks
```sql
tasks (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status task_status DEFAULT 'not-started',
  priority task_priority DEFAULT 'medium',
  task_type TEXT DEFAULT 'regular',
  punch_list_category TEXT,
  project_id UUID REFERENCES projects(id),
  assignee_id UUID REFERENCES profiles(id),
  assigned_stakeholder_id UUID REFERENCES stakeholders(id)
)
```

### Status Enums

#### Project Lifecycle Status
```sql
CREATE TYPE project_lifecycle_status AS ENUM (
  'pre_construction',
  'mobilization',
  'construction', 
  'punch_list',
  'final_inspection',
  'closeout',
  'warranty',
  'on_hold',
  'cancelled'
);
```

## API Integration

### Supabase Client Configuration
```typescript
import { supabase } from '@/integrations/supabase/client';

// Basic query pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);

// Real-time subscription
const channel = supabase
  .channel('schema-db-changes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    // Handle real-time updates
  })
  .subscribe();
```

### React Query Integration
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    if (error) throw error;
    return data;
  }
});
```

## Troubleshooting

### Common Issues

#### Navigation Issues
- **Problem**: Inconsistent navigation state
- **Solution**: Use searchParams-based navigation with context preservation
- **Components**: Check `useNavigation` hook and URL parameter handling

#### Permission Errors
- **Problem**: "Row Level Security policy violation"
- **Solution**: Verify user has correct `is_company_user` and `account_status`
- **Check**: Authentication hooks and RLS policies

#### Status Transition Errors
- **Problem**: Invalid status transitions
- **Solution**: Use `validateStatusTransition` utility
- **Components**: `EnhancedStatusTransitionDialog`

#### Mobile Responsiveness
- **Problem**: UI not mobile-friendly
- **Solution**: Use mobile-first design patterns
- **Components**: `ResponsiveDialog`, `TouchFriendlyButton`

### Performance Optimization

#### Large Data Sets
- Use virtualization for long lists
- Implement pagination for large tables
- Use React Query for caching

#### Real-time Updates
- Limit subscription scope
- Use selective re-rendering
- Implement optimistic updates

### Security Best Practices

#### Row Level Security
- All tables should have RLS enabled
- Use security definer functions for complex permissions
- Avoid recursive RLS policies

#### Authentication
- Always check authentication status
- Use appropriate permission hooks
- Implement proper error handling

## File Structure

```
src/
├── components/
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard components
│   ├── projects/         # Project management
│   ├── tasks/           # Task management
│   ├── stakeholders/    # Stakeholder management
│   ├── resources/       # Resource management
│   ├── documents/       # Document management
│   ├── navigation/      # Navigation components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── integrations/       # External integrations
    └── supabase/       # Supabase configuration
```

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

### Component Design
- Keep components focused and small
- Use composition over inheritance  
- Implement proper prop interfaces
- Add loading and error states

### State Management
- Use React Query for server state
- Use local state for UI state
- Implement optimistic updates
- Handle loading states gracefully

---

For additional help, refer to specific component documentation or contact the development team.
