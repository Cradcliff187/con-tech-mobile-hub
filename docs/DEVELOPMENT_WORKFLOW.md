
# Development Workflow Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase CLI (optional)
- Git

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd construction-project-management

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

### Directory Organization
```
src/
├── components/          # React components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard-specific
│   ├── projects/       # Project management
│   ├── tasks/          # Task management
│   ├── stakeholders/   # Stakeholder management
│   ├── resources/      # Resource management
│   ├── navigation/     # Navigation components
│   └── ui/            # Base UI components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript definitions
├── integrations/       # External API integrations
└── pages/             # Main page components
```

### Component Guidelines

#### File Naming
- Components: `PascalCase.tsx`
- Hooks: `use*.tsx`
- Utils: `camelCase.ts`
- Types: `camelCase.ts`

#### Component Structure
```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentProps } from './types';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  // Destructured props
}) => {
  // Component logic
  
  return (
    // JSX with proper accessibility
    <div className="responsive-classes">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Development Best Practices

### TypeScript Guidelines

#### Interface Definition
```typescript
// Always define prop interfaces
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

#### Type Safety
```typescript
// Use proper typing for API responses
interface ApiResponse<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

// Type database entities
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  unified_lifecycle_status?: UnifiedLifecycleStatus;
}
```

### React Patterns

#### Custom Hooks
```typescript
// useProjectData.tsx
export const useProjectData = (projectId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId
  });

  return { project: data, isLoading, error };
};
```

#### Error Handling
```typescript
// Component with error boundary
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => setError(null)} />;
  }

  return <ComponentContent />;
};
```

### State Management

#### React Query Usage
```typescript
// Data fetching with React Query
const { data: projects, isLoading } = useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');
    if (error) throw error;
    return data;
  }
});

// Mutations with optimistic updates
const mutation = useMutation({
  mutationFn: updateProject,
  onMutate: async (newProject) => {
    // Optimistic update
    await queryClient.cancelQueries({ queryKey: ['projects'] });
    const previousProjects = queryClient.getQueryData(['projects']);
    queryClient.setQueryData(['projects'], old => 
      old?.map(p => p.id === newProject.id ? newProject : p)
    );
    return { previousProjects };
  },
  onError: (err, newProject, context) => {
    // Rollback on error
    queryClient.setQueryData(['projects'], context?.previousProjects);
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  }
});
```

#### Local State
```typescript
// Use local state for UI-only state
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedItems, setSelectedItems] = useState<string[]>([]);
const [filters, setFilters] = useState<FilterState>({});
```

## Styling Guidelines

### Tailwind CSS Usage

#### Responsive Design
```typescript
// Mobile-first responsive classes
<div className="
  flex flex-col          // Mobile: vertical stack
  md:flex-row           // Tablet+: horizontal
  gap-4 md:gap-6        // Responsive spacing
  p-4 md:p-6 lg:p-8     // Responsive padding
">
```

#### Component Variants
```typescript
// Define variant classes
const buttonVariants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-200 hover:bg-slate-300 text-slate-900",
  ghost: "hover:bg-slate-100 text-slate-700"
};

const Button = ({ variant = 'primary', ...props }) => (
  <button 
    className={`px-4 py-2 rounded-md ${buttonVariants[variant]}`}
    {...props}
  />
);
```

#### Construction Color Scheme
```typescript
// Use consistent construction colors
const colors = {
  primary: 'blue-600',      // Primary actions
  secondary: 'slate-600',   // Secondary elements  
  accent: 'orange-600',     // Accent/warning
  success: 'green-600',     // Success states
  warning: 'yellow-600',    // Warning states
  error: 'red-600',         // Error states
  info: 'blue-500'          // Info states
};
```

## Database Integration

### Supabase Patterns

#### Basic Queries
```typescript
// Simple select
const { data: projects } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'active');

// Join with relationships
const { data: projectsWithStakeholders } = await supabase
  .from('projects')
  .select(`
    *,
    client:stakeholders!client_id(name, contact_person),
    project_manager:profiles!project_manager_id(full_name)
  `);
```

#### Real-time Subscriptions
```typescript
useEffect(() => {
  const channel = supabase
    .channel('project-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects'
    }, (payload) => {
      // Handle real-time updates
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

#### RPC Function Calls
```typescript
// Call database functions
const { data: validation } = await supabase
  .rpc('validate_project_status_transition', {
    project_id: projectId,
    new_status: newStatus
  });
```

### Error Handling
```typescript
const handleDatabaseError = (error: PostgrestError) => {
  console.error('Database error:', error);
  
  // Handle specific error types
  if (error.code === 'PGRST116') {
    toast.error('Access denied');
  } else if (error.code === '23505') {
    toast.error('Duplicate entry');
  } else {
    toast.error('Database operation failed');
  }
};
```

## Testing Strategy

### Component Testing
```typescript
// Example component test
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectCard } from './ProjectCard';

describe('ProjectCard', () => {
  const mockProject = {
    id: '1',
    name: 'Test Project',
    status: 'active',
    progress: 50
  };

  it('displays project information', () => {
    render(<ProjectCard project={mockProject} />);
    
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// Test with React Query
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};
```

## Performance Optimization

### React Optimization
```typescript
// Memoize expensive components
const ExpensiveChart = React.memo(({ data }) => {
  const processedData = useMemo(() => 
    expensiveDataProcessing(data), [data]
  );
  
  return <Chart data={processedData} />;
});

// Optimize callback functions
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);
```

### Bundle Optimization
```typescript
// Lazy load components
const GanttChart = lazy(() => import('./GanttChart'));

// Code splitting by route
const ProjectsPage = lazy(() => import('../pages/Projects'));
```

## Deployment Guidelines

### Environment Variables
```bash
# .env.local
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Build Process
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Database Migrations
```sql
-- Always use migrations for schema changes
-- supabase/migrations/timestamp_description.sql

-- Add new column
ALTER TABLE projects ADD COLUMN new_field TEXT;

-- Create index
CREATE INDEX idx_projects_status ON projects(status);

-- Update RLS policies
CREATE POLICY "policy_name" ON table_name FOR action USING (condition);
```

## Debugging Guidelines

### Development Tools
- React Developer Tools
- Supabase Dashboard
- Browser Network Tab
- React Query DevTools

### Common Debug Patterns
```typescript
// Debug React Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to app root
<ReactQueryDevtools initialIsOpen={false} />

// Debug component renders
useEffect(() => {
  console.log('Component rendered with:', props);
}, [props]);

// Debug API calls
const debugQuery = useQuery({
  queryKey: ['debug-data'],
  queryFn: async () => {
    console.log('Fetching data...');
    const result = await fetchData();
    console.log('Data received:', result);
    return result;
  }
});
```

## Code Review Checklist

### Before Submitting
- [ ] TypeScript compilation passes
- [ ] No console errors in browser
- [ ] Mobile responsiveness tested
- [ ] Accessibility standards met
- [ ] Error handling implemented
- [ ] Loading states provided
- [ ] Tests written/updated

### Review Points
- [ ] Code follows established patterns
- [ ] Components are properly typed  
- [ ] Performance considerations addressed
- [ ] Security best practices followed
- [ ] Database queries optimized
- [ ] UI/UX consistency maintained

---

This workflow ensures consistent, maintainable, and high-quality code across the construction project management application.
