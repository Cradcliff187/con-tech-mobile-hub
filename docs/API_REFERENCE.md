
# ConstructPro API Reference

## Overview
This document outlines the API patterns and data structures used in the ConstructPro application.

## Authentication

### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileData | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}
```

### Usage
```typescript
const { user, profile, signIn, signOut } = useAuth();
```

## Data Types

### Profile
```typescript
interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_company_user?: boolean;
  auto_approved?: boolean;
  account_status?: string;
  invited_by?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent?: number;
  progress: number;
  location?: string;
  project_manager_id?: string;
  client_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Stakeholder
```typescript
interface Stakeholder {
  id: string;
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
  specialties?: string[];
  rating?: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  license_number?: string;
  insurance_expiry?: string;
  crew_size?: number;
  created_at: string;
  updated_at: string;
}
```

## Custom Hooks

### useStakeholders
```typescript
const {
  stakeholders,    // Stakeholder[]
  loading,         // boolean
  createStakeholder, // (data: Partial<Stakeholder>) => Promise<{data, error}>
  updateStakeholder, // (id: string, data: Partial<Stakeholder>) => Promise<{data, error}>
  deleteStakeholder, // (id: string) => Promise<{error}>
  refetch          // () => Promise<void>
} = useStakeholders();
```

### useProjects
```typescript
const {
  projects,        // Project[]
  loading,         // boolean
  createProject,   // (data: Partial<Project>) => Promise<{data, error}>
  refetch          // () => Promise<void>
} = useProjects();
```

### useTasks
```typescript
const {
  tasks,           // Task[]
  loading,         // boolean
  createTask,      // (data: Partial<Task>) => Promise<{data, error}>
  updateTask,      // (id: string, data: Partial<Task>) => Promise<{data, error}>
  deleteTask,      // (id: string) => Promise<{error}>
  refetch          // () => Promise<void>
} = useTasks();
```

## Service APIs

### authApi
```typescript
const authApi = {
  fetchProfile: (userId: string) => Promise<ProfileData | null>,
  updateLastLogin: (userId: string) => Promise<void>,
  signUp: (email: string, password: string, fullName?: string) => Promise<{data, error}>,
  signIn: (email: string, password: string) => Promise<{data, error}>,
  signOut: () => Promise<{error}>
};
```

### userApi
```typescript
const userApi = {
  fetchUsers: () => Promise<UserProfile[]>,
  updateUserRole: (userId: string, role: string) => Promise<{error}>,
  updateUserStatus: (userId: string, status: string) => Promise<{error}>,
  deleteUser: (userId: string) => Promise<{error}>,
  createExternalUser: (userData: CreateExternalUserData) => Promise<CreateUserResult>
};
```

## Error Handling

### Error Types
```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
```

### Error Patterns
```typescript
// Service layer error handling
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  
  if (error) throw error;
  return data;
} catch (error) {
  console.error('Error:', error);
  throw error;
}

// Component error handling
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await apiCall();
  } catch (err) {
    setError(err.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

## Best Practices

### Data Fetching
- Use React Query for caching and synchronization
- Implement proper loading and error states
- Use optimistic updates for better UX
- Handle stale data appropriately

### State Management
- Keep server state separate from client state
- Use local state for UI interactions
- Implement proper cleanup in useEffect

### Performance
- Memoize expensive calculations
- Use callbacks for event handlers
- Implement pagination for large datasets
- Lazy load components when appropriate
```
