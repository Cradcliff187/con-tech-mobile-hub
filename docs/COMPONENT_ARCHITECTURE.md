
# ConstructPro Component Architecture

## Overview
This document outlines the component architecture and design patterns used in the ConstructPro application.

## Directory Structure

```
src/
├── components/
│   ├── common/           # Shared components across the app
│   ├── dashboard/        # Dashboard-specific components
│   ├── navigation/       # Navigation components
│   ├── stakeholders/     # Stakeholder management components
│   ├── tasks/           # Task management components
│   ├── resources/       # Resource management components
│   └── ui/              # Base UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── services/            # API service functions
└── pages/               # Page components
```

## Component Design Patterns

### 1. Composition Pattern
Components are designed to be composable and reusable:
- Base UI components in `src/components/ui/`
- Feature-specific components that compose base components
- Container/presentation component separation

### 2. Custom Hooks Pattern
Business logic is extracted into custom hooks:
- `useAuth` - Authentication state management
- `useStakeholders` - Stakeholder data management
- `useProjects` - Project data management
- `useTasks` - Task data management

### 3. Error Boundary Pattern
Error handling is implemented using React Error Boundaries:
- `ErrorBoundary` component wraps main content areas
- Graceful error fallback UI
- Error logging for debugging

### 4. Form Management Pattern
Forms use a consistent pattern:
- Dedicated form field components
- Custom form hooks for state management
- Validation and error handling
- Separation of form logic from UI

## Component Guidelines

### Naming Conventions
- Components: PascalCase (e.g., `StakeholderCard`)
- Files: PascalCase for components, camelCase for hooks/utilities
- Props: camelCase
- Types/Interfaces: PascalCase

### Performance Optimization
- Use `React.memo` for components that receive stable props
- Implement `useCallback` for event handlers passed to children
- Use `useMemo` for expensive computations
- Debounce search inputs to reduce re-renders

### Accessibility
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance

## State Management

### Local State
- Component state using `useState`
- Form state in custom hooks
- UI state (modals, dropdowns, etc.)

### Server State
- React Query for data fetching and caching
- Automatic background refetching
- Optimistic updates where appropriate

### Global State
- Context API for authentication
- URL state for routing and filters
- Local storage for user preferences

## Testing Strategy

### Unit Tests
- Test custom hooks in isolation
- Test component behavior and props
- Mock external dependencies

### Integration Tests
- Test component interactions
- Test data flow between components
- Test error scenarios

### E2E Tests
- Test complete user workflows
- Test critical paths through the application
- Test responsive design on different screen sizes
```
