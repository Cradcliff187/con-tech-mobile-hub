
# Construction Management App - Design System

## Overview
This document outlines the design system for the construction management application, including component patterns, styling guidelines, and usage examples.

## Color Palette

### Primary Colors
- **Blue**: `#3B82F6` - Primary actions, links, and navigation
- **Slate**: `#64748B` - Text, borders, and neutral elements  
- **Orange**: `#EA580C` - Accent color for safety alerts and important actions

### Semantic Colors
- **Success**: `#10B981` - Completed tasks, successful operations
- **Warning**: `#F59E0B` - Caution, pending states
- **Error**: `#EF4444` - Errors, destructive actions
- **Info**: `#0EA5E9` - Information, help text

## Typography

### Font Hierarchy
- **Heading 1**: `text-3xl font-bold` (30px)
- **Heading 2**: `text-2xl font-semibold` (24px)
- **Heading 3**: `text-xl font-semibold` (20px)
- **Heading 4**: `text-lg font-semibold` (18px)
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Caption**: `text-xs` (12px)

## Spacing System

### Standard Spacing Scale
- **xs**: `2px` - Tight spacing
- **sm**: `4px` - Small spacing
- **md**: `8px` - Default spacing
- **lg**: `16px` - Medium spacing
- **xl**: `24px` - Large spacing
- **2xl**: `32px` - Extra large spacing

## Component Categories

### 1. Form Components
- **Input**: Text input fields with validation states
- **Select**: Dropdown selection with search capability
- **Checkbox**: Binary choice selection
- **Switch**: Toggle between two states
- **Textarea**: Multi-line text input
- **Button**: Primary, secondary, and utility actions

### 2. Data Display
- **Card**: Container for related information
- **Badge**: Status indicators and labels
- **Avatar**: User profile representation
- **Progress**: Task completion indicators
- **Table**: Structured data presentation

### 3. Feedback Components
- **Alert**: System messages and notifications
- **Toast**: Temporary feedback messages
- **Loading**: Spinners and skeleton states
- **Empty State**: No data scenarios
- **Tooltip**: Contextual help information

### 4. Navigation
- **Tabs**: Content organization
- **Breadcrumbs**: Navigation hierarchy
- **Sidebar**: Main navigation structure
- **Menu**: Contextual action lists

### 5. Layout Components
- **Page Header**: Consistent page titles and actions
- **Separator**: Visual content division
- **Container**: Content width constraints
- **Grid**: Responsive layout system

## Usage Guidelines

### Accessibility
- Maintain 4.5:1 color contrast ratio
- Use semantic HTML elements
- Provide keyboard navigation
- Include ARIA labels for screen readers
- Ensure 44px minimum touch target size

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid system
- Touch-friendly interactions on mobile

### Animation Principles
- Smooth transitions (200-300ms duration)
- Easing functions: `ease-out` for entrances, `ease-in` for exits
- Hover states with subtle scale (1.02x) and shadow effects
- Loading states with skeleton animations

### Construction-Specific Patterns

#### Safety Alerts
```tsx
<Alert className="border-orange-200 bg-orange-50">
  <AlertCircle className="h-4 w-4 text-orange-600" />
  <AlertTitle className="text-orange-800">Safety Notice</AlertTitle>
  <AlertDescription className="text-orange-700">
    Hard hat required in this construction zone.
  </AlertDescription>
</Alert>
```

#### Project Status Indicators
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Planning</Badge>
<Badge variant="outline">On Hold</Badge>
<Badge variant="destructive">Delayed</Badge>
```

#### Task Progress
```tsx
<Progress value={75} className="h-2" />
<span className="text-sm text-slate-600">75% Complete</span>
```

## Component API Reference

### Button
```tsx
interface ButtonProps {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### PageHeader
```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: { text: string; variant: BadgeVariant };
  meta?: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  actions?: Array<{ label: string; onClick: () => void; variant?: ButtonVariant; icon?: React.ReactNode }>;
  primaryAction?: { label: string; onClick: () => void; icon?: React.ReactNode };
}
```

### EmptyState
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

## Best Practices

### Do's
- Use consistent spacing from the scale
- Provide loading states for async operations
- Include hover and focus states for interactive elements
- Use semantic colors (green for success, red for errors)
- Implement proper error boundaries
- Add tooltips for icon-only buttons

### Don'ts
- Don't use arbitrary spacing values
- Don't mix different design patterns
- Don't create overly complex component hierarchies
- Don't ignore accessibility requirements
- Don't use colors without semantic meaning

## Development Workflow

1. **Design Review**: Check Figma designs for consistency
2. **Component Creation**: Use existing patterns and extend as needed
3. **Testing**: Verify responsive behavior and accessibility
4. **Documentation**: Update this guide with new patterns
5. **Review**: Peer review for consistency and best practices

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Changelog

- **v1.0.0**: Initial design system documentation
- **v1.1.0**: Added construction-specific patterns and component showcase
