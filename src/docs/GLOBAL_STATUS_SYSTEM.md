
# Global Status System Documentation

## Overview

The GlobalStatusDropdown provides a unified, consistent status management system across all entities in the construction management application. This system ensures type safety, visual consistency, and maintainable status workflows throughout the entire application.

### Key Benefits
- **Consistency**: Unified visual design and behavior across all entity types
- **Type Safety**: Strongly typed status values prevent runtime errors
- **Maintainability**: Single source of truth for status configurations
- **User Experience**: Consistent interaction patterns and confirmation flows
- **Critical Change Protection**: Built-in safeguards for important status transitions

## Supported Entity Types

### Project Status Flow
```
pre_construction → mobilization → construction → punch_list → final_inspection → closeout → warranty
                                                     ↓
                                              on_hold / cancelled
```

**Statuses**: `pre_construction`, `mobilization`, `construction`, `punch_list`, `final_inspection`, `closeout`, `warranty`, `on_hold`, `cancelled`

**Critical Changes**: `cancelled`, `on_hold`

### Task Status Flow
```
not-started → in-progress → completed
                 ↓
            blocked (can return to in-progress)
```

**Statuses**: `not-started`, `in-progress`, `completed`, `blocked`

**Critical Changes**: `blocked`

### Stakeholder Status Flow
```
pending → active → inactive
    ↓        ↓
suspended ← ─ ┘
```

**Statuses**: `active`, `inactive`, `pending`, `suspended`

**Critical Changes**: `suspended`, `inactive`

### Equipment Status Flow
```
available → in-use → maintenance → available
    ↓           ↓         ↓
out-of-service ← ─ ─ ─ ─ ─ ┘
```

**Statuses**: `available`, `in-use`, `maintenance`, `out-of-service`

**Critical Changes**: `out-of-service`, `maintenance`

### Maintenance Task Status Flow
```
scheduled → in_progress → completed
    ↓           ↓
cancelled   overdue
```

**Statuses**: `scheduled`, `in_progress`, `completed`, `cancelled`, `overdue`

**Critical Changes**: `overdue`, `cancelled`

### Profile Status Flow
```
pending → approved → inactive
```

**Statuses**: `pending`, `approved`, `inactive`

**Critical Changes**: `inactive`

### Budget Item Status Flow
```
pending → approved
    ↓
rejected
```

**Statuses**: `pending`, `approved`, `rejected`

**Critical Changes**: `rejected`

## Component API Reference

### Props Interface

```typescript
interface GlobalStatusDropdownProps {
  entityType: EntityType;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void | Promise<void>;
  isUpdating?: boolean;
  showAsDropdown?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  confirmCriticalChanges?: boolean;
  className?: string;
}
```

### Basic Usage Examples

#### Interactive Dropdown Mode
```tsx
<GlobalStatusDropdown
  entityType="equipment"
  currentStatus={equipment.status}
  onStatusChange={handleStatusChange}
  size="md"
  confirmCriticalChanges={true}
/>
```

#### Badge-Only Display Mode
```tsx
<GlobalStatusDropdown
  entityType="task"
  currentStatus={task.status}
  onStatusChange={() => {}}
  showAsDropdown={false}
  size="sm"
/>
```

#### With Loading State
```tsx
<GlobalStatusDropdown
  entityType="project"
  currentStatus={project.unified_lifecycle_status}
  onStatusChange={handleProjectStatusChange}
  isUpdating={isUpdatingStatus}
  disabled={!canModifyProject}
  size="lg"
/>
```

## Critical Status Changes

The system automatically detects and requires confirmation for critical status changes that may have significant business implications:

### Confirmation Flow
1. User selects a critical status (e.g., "Cancelled", "Out of Service")
2. System displays confirmation dialog with warning message
3. User must explicitly confirm the action
4. Status change proceeds only after confirmation

### Bypassing Confirmation
```tsx
<GlobalStatusDropdown
  entityType="equipment"
  currentStatus={status}
  onStatusChange={handleChange}
  confirmCriticalChanges={false} // Disables confirmation
/>
```

## Utility Functions

### Available Exports

```typescript
// Get status configuration for an entity type
const config = getStatusConfig('equipment');

// Check if a status change is critical
const isCritical = isCriticalStatusChange('project', 'cancelled');

// Get all available statuses for an entity
const statuses = getAvailableStatuses('maintenance_task');

// Validate if a status is valid for an entity type
const isValid = isValidStatus('task', 'in-progress');
```

### Usage Examples

```typescript
import { 
  getStatusConfig, 
  isCriticalStatusChange, 
  getAvailableStatuses 
} from '@/components/ui/global-status-dropdown';

// Programmatic status validation
const validateTaskStatus = (status: string) => {
  const availableStatuses = getAvailableStatuses('task');
  return availableStatuses.includes(status);
};

// Check if confirmation is needed
const needsConfirmation = isCriticalStatusChange('equipment', 'out-of-service');
```

## Implementation Examples

### Equipment Management
```tsx
const ProjectEquipmentSection = ({ project }) => {
  const handleStatusChange = async (equipmentId: string, newStatus: string) => {
    try {
      await updateEquipmentStatus(equipmentId, newStatus);
      toast.success('Equipment status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <ResponsiveTable
      columns={[
        {
          key: 'status',
          label: 'Status',
          render: (status, equipment) => (
            <GlobalStatusDropdown
              entityType="equipment"
              currentStatus={status}
              onStatusChange={(newStatus) => handleStatusChange(equipment.id, newStatus)}
              size="sm"
            />
          )
        }
      ]}
      data={equipment}
    />
  );
};
```

### Task Management
```tsx
const TaskCard = ({ task }) => {
  const { updateTaskStatus } = useTasks();
  
  const handleStatusChange = async (newStatus: string) => {
    await updateTaskStatus(task.id, { status: newStatus });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3>{task.title}</h3>
          <GlobalStatusDropdown
            entityType="task"
            currentStatus={task.status}
            onStatusChange={handleStatusChange}
            size="sm"
          />
        </div>
      </CardHeader>
    </Card>
  );
};
```

## Migration Guide

### From Legacy Components

#### Before (Legacy Component)
```tsx
// Old pattern - multiple different status components
<TaskStatusDropdown status={task.status} onChange={handleChange} />
<EquipmentStatusBadge status={equipment.status} />
<ProjectStatusSelector project={project} />
```

#### After (GlobalStatusDropdown)
```tsx
// New pattern - unified component
<GlobalStatusDropdown
  entityType="task"
  currentStatus={task.status}
  onStatusChange={handleChange}
/>

<GlobalStatusDropdown
  entityType="equipment"
  currentStatus={equipment.status}
  onStatusChange={() => {}}
  showAsDropdown={false}
/>

<GlobalStatusDropdown
  entityType="project"
  currentStatus={project.unified_lifecycle_status}
  onStatusChange={handleProjectStatusChange}
/>
```

### Migration Checklist

1. **Identify Legacy Components**: Search for old status-related components
2. **Update Entity Types**: Ensure entity types match supported values
3. **Status Value Mapping**: Map old status values to new standardized values
4. **Handler Updates**: Update status change handlers to use new patterns
5. **Remove Old Components**: Delete legacy status components after migration
6. **Test Critical Changes**: Verify confirmation flows work correctly

## Best Practices

### DO ✅
- Always specify the correct `entityType` for proper status validation
- Use `showAsDropdown={false}` for read-only status displays
- Implement proper error handling in `onStatusChange` handlers
- Use appropriate `size` prop for the UI context
- Enable `confirmCriticalChanges` for important status transitions

### DON'T ❌
- Don't bypass type checking with `any` types
- Don't implement custom status change confirmations (use built-in system)
- Don't mix legacy status components with GlobalStatusDropdown
- Don't forget to handle async operations in status change handlers
- Don't use invalid status values not defined in the configuration

## Troubleshooting

### Common Issues

#### Status Not Updating
```typescript
// ❌ Wrong - missing await
const handleStatusChange = (newStatus: string) => {
  updateStatus(id, newStatus); // No await
};

// ✅ Correct - proper async handling
const handleStatusChange = async (newStatus: string) => {
  try {
    await updateStatus(id, newStatus);
    refetch(); // Refresh data after update
  } catch (error) {
    console.error('Status update failed:', error);
  }
};
```

#### Invalid Status Values
```typescript
// ❌ Wrong - using non-existent status
<GlobalStatusDropdown
  entityType="equipment"
  currentStatus="broken" // Invalid - should be "out-of-service"
  onStatusChange={handleChange}
/>

// ✅ Correct - using valid status
<GlobalStatusDropdown
  entityType="equipment"
  currentStatus="out-of-service"
  onStatusChange={handleChange}
/>
```

#### Missing Entity Type Configuration
```typescript
// Check if configuration exists
const config = getStatusConfig('my_entity');
if (!config) {
  console.warn('No status configuration found for entity type: my_entity');
  // Handle gracefully or add configuration
}
```

## Future Enhancements

### Planned Features
- **Status Transition Validation**: Server-side validation of status transitions
- **Audit Trail**: Track status change history with timestamps and user info
- **Batch Operations**: Support for bulk status updates
- **Custom Status Colors**: Theme-based status color customization
- **Workflow Integration**: Integration with approval workflows for sensitive changes

### Contributing
When adding new entity types or status values:

1. Update the `STATUS_CONFIGS` object in `global-status-dropdown.tsx`
2. Add corresponding TypeScript types
3. Update this documentation
4. Add test cases for new configurations
5. Update any related database schemas

---

**Last Updated**: 2024-06-23
**Version**: 1.0.0
**Maintainer**: Construction Management Development Team
