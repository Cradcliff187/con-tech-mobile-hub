# Component Reference Guide

## Navigation Components

### DesktopSidebar
Desktop navigation with collapsible sections and project context.

```typescript
interface DesktopSidebarProps {
  currentSection?: string;
  currentProject?: string;
}
```

**Usage:**
```typescript
<DesktopSidebar 
  currentSection="projects" 
  currentProject="uuid-here" 
/>
```

### MobileNavigation
Mobile-responsive navigation with touch-friendly interface.

```typescript
interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}
```

### Breadcrumbs
Context-aware breadcrumb navigation.

```typescript
interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
}
```

## Status Components

### EnhancedUnifiedStatusBadge
Displays project lifecycle status with consistent styling.

```typescript
interface EnhancedUnifiedStatusBadgeProps {
  status: UnifiedLifecycleStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
}
```

**Status Types:**
- `pre_construction` - Initial planning phase
- `mobilization` - Resource mobilization
- `construction` - Active construction
- `punch_list` - Quality corrections
- `final_inspection` - Final inspections
- `closeout` - Project closeout
- `warranty` - Warranty period
- `on_hold` - Temporarily suspended
- `cancelled` - Project cancelled

### ProjectStatusDisplay
Comprehensive project status with progression indicator.

```typescript
interface ProjectStatusDisplayProps {
  project: Project;
  showProgression?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  interactive?: boolean;
}
```

## Dialog Components

### ResponsiveDialog
Mobile-responsive dialog that adapts to screen size.

```typescript
interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}
```

### EnhancedStatusTransitionDialog
Status change confirmation with validation.

```typescript
interface EnhancedStatusTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentStatus: UnifiedLifecycleStatus;
  targetStatus: UnifiedLifecycleStatus;
  project: any;
  onConfirm: () => void;
  isLoading?: boolean;
}
```

## Project Components

### ProjectCard
Project overview card with status, progress, and quick actions.

```typescript
interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    progress: number;
    budget?: number;
    spent?: number;
    status: ProjectStatus;
    phase: ProjectPhase;
    unified_lifecycle_status?: UnifiedLifecycleStatus;
    // ... other project fields
  };
}
```

### CreateProjectDialog
Project creation modal with form validation.

```typescript
interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}
```

### ProjectQuickActions
Quick action buttons for project management.

```typescript
interface ProjectQuickActionsProps {
  project: Project;
  variant?: 'inline' | 'dropdown' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}
```

## Task Components

### TaskManager
Main task management interface with filtering and bulk actions.

```typescript
interface TaskManagerProps {
  projectId?: string;
  defaultView?: 'list' | 'board' | 'gantt';
}
```

### GanttChart
Interactive Gantt chart for project timeline visualization.

```typescript
interface GanttChartProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  viewMode?: 'day' | 'week' | 'month';
  showCriticalPath?: boolean;
}
```

### TaskItem
Individual task display with status and assignment information.

```typescript
interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  showProject?: boolean;
  compact?: boolean;
}
```

## Stakeholder Components

### StakeholderDirectory
Comprehensive stakeholder listing with search and filters.

```typescript
interface StakeholderDirectoryProps {
  projectId?: string;
  stakeholderType?: StakeholderType;
  defaultView?: 'grid' | 'list' | 'table';
}
```

### StakeholderCard
Individual stakeholder display with contact and performance info.

```typescript
interface StakeholderCardProps {
  stakeholder: Stakeholder;
  showPerformance?: boolean;
  showContactInfo?: boolean;
  onEdit?: (stakeholder: Stakeholder) => void;
}
```

### StakeholderAssignments
Stakeholder assignment management with time tracking.

```typescript
interface StakeholderAssignmentsProps {
  stakeholderId?: string;
  projectId?: string;
  showTimeTracking?: boolean;
}
```

## Common UI Components

### TouchFriendlyButton
Button optimized for touch interfaces with proper sizing.

```typescript
interface TouchFriendlyButtonProps extends ButtonProps {
  size?: 'sm' | 'md' | 'lg';
  touchOptimized?: boolean;
}
```

**Minimum Touch Sizes:**
- Small: 36px
- Medium: 44px  
- Large: 48px

### LoadingSpinner
Consistent loading indicator with size variants.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  overlay?: boolean;
}
```

### ErrorBoundary
Error boundary component for graceful error handling.

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{error: Error}>;
  onError?: (error: Error) => void;
}
```

## Form Components

### ProjectFormFields
Reusable project form fields with validation.

```typescript
interface ProjectFormFieldsProps {
  form: UseFormReturn<ProjectFormData>;
  mode?: 'create' | 'edit';
  showAdvanced?: boolean;
}
```

### AddressFormFields
Structured address input fields.

```typescript
interface AddressFormFieldsProps {
  form: UseFormReturn<any>;
  prefix?: string; // field name prefix
  required?: boolean;
}
```

### TaskProjectLifecycleField
Task form field that shows project lifecycle status context.

```typescript
interface TaskProjectLifecycleFieldProps {
  project?: Project;
  taskType?: 'regular' | 'punch_list';
}
```

## Utility Components  

### MigrationWarning
Migration status and warning display.

```typescript
interface MigrationWarningProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'warning' | 'info' | 'error' | 'success';
  dismissible?: boolean;
  progress?: number;
  isLoading?: boolean;
}
```

## Responsive Design Patterns

### Mobile-First Components
All components follow mobile-first design:

```typescript
// Example responsive classes
<div className="
  flex flex-col          // Mobile: stack vertically
  md:flex-row           // Tablet+: horizontal layout
  gap-4                 // Consistent spacing
  p-4 md:p-6           // Responsive padding
">
```

### Touch-Friendly Interactions
```typescript
// Minimum touch target sizes
className="
  min-h-[44px]         // Minimum touch height
  min-w-[44px]         // Minimum touch width  
  touch-manipulation   // Optimize touch response
"
```

### Breakpoint Guidelines
- **Mobile**: 320px - 639px (default)
- **Tablet**: 640px - 1023px (sm, md)
- **Desktop**: 1024px+ (lg, xl, 2xl)

## Performance Best Practices

### Component Optimization
```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }) => {
  return <ComplexVisualization data={data} />;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

### Loading States
```typescript
// Always provide loading states
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorDisplay error={error} />;
return <ComponentContent data={data} />;
```

---

For specific implementation details, refer to the component source files in `src/components/`.
