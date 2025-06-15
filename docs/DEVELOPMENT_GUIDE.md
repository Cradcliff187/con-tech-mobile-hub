
# ConstructPro Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Code Standards

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface definitions for all data structures
- No `any` types (use `unknown` if needed)

### React Best Practices
- Functional components with hooks
- Proper dependency arrays for hooks
- Error boundaries for error handling
- Lazy loading for large components

### Styling
- Tailwind CSS for all styling
- shadcn/ui components as base
- Responsive design mobile-first
- Consistent spacing using Tailwind classes

### File Organization
- One component per file
- Co-locate related files (hooks, types, utils)
- Use index files for clean imports
- Separate business logic from UI logic

## Performance Guidelines

### Component Optimization
```typescript
// Use memo for stable props
const MyComponent = memo(({ data, onAction }) => {
  // Use callback for event handlers
  const handleClick = useCallback(() => {
    onAction(data.id);
  }, [onAction, data.id]);

  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return expensiveCalculation(data);
  }, [data]);

  return <div onClick={handleClick}>{processedData}</div>;
});
```

### Data Fetching
- Use React Query for server state
- Implement proper loading states
- Handle error states gracefully
- Use optimistic updates for better UX

### Bundle Optimization
- Lazy load routes and heavy components
- Tree-shake unused code
- Optimize images and assets
- Use code splitting for large dependencies

## Testing

### Unit Tests
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Hook Testing
```typescript
import { renderHook } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

test('hook returns expected values', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe(expectedValue);
});
```

## Debugging

### Development Tools
- React Developer Tools
- Supabase Dashboard
- Network tab for API calls
- Console logging for data flow

### Error Handling
- Use Error Boundaries for component errors
- Implement proper error states in UI
- Log errors for production debugging
- Provide helpful error messages to users

## Deployment

### Build Process
1. Run tests: `npm test`
2. Build application: `npm run build`
3. Deploy to hosting platform
4. Verify deployment

### Environment Variables
- Development: `.env.local`
- Production: Set in hosting platform
- Never commit sensitive variables
- Use type-safe environment validation

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Messages
```
type(scope): description

feat(auth): add user authentication
fix(ui): resolve mobile layout issue
docs(api): update API documentation
refactor(hooks): simplify data fetching logic
```

### Pull Requests
- Clear description of changes
- Link to related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Request appropriate reviewers
```
