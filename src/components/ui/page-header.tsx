
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const pageHeaderVariants = cva(
  "space-y-4",
  {
    variants: {
      variant: {
        default: "",
        compact: "space-y-2",
        spacious: "space-y-6",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const titleVariants = cva(
  "font-bold text-slate-800",
  {
    variants: {
      size: {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-3xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string;
  description?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  breadcrumbs?: React.ReactNode;
  actions?: PageHeaderAction[];
  primaryAction?: PageHeaderAction;
  backButton?: {
    label?: string;
    onClick: () => void;
  };
  tabs?: React.ReactNode;
  meta?: Array<{
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }>;
}

/**
 * PageHeader - Consistent page header component
 * 
 * @example Basic usage
 * <PageHeader
 *   title="Project Dashboard"
 *   description="Manage your construction projects and track progress"
 *   primaryAction={{
 *     label: "New Project",
 *     onClick: handleNewProject,
 *     icon: <Plus size={16} />
 *   }}
 * />
 * 
 * @example With badge and meta info
 * <PageHeader
 *   title="Construction Site Alpha"
 *   description="Downtown office building construction"
 *   badge={{ text: "Active", variant: "default" }}
 *   meta={[
 *     { label: "Progress", value: "65%", icon: <BarChart size={16} /> },
 *     { label: "Due Date", value: "Dec 2024", icon: <Calendar size={16} /> }
 *   ]}
 *   actions={[
 *     { label: "Edit", onClick: handleEdit, variant: "outline" },
 *     { label: "Share", onClick: handleShare, variant: "ghost" }
 *   ]}
 * />
 * 
 * @example With tabs
 * <PageHeader
 *   title="Task Management"
 *   description="Track and manage project tasks"
 *   tabs={<TaskTabs />}
 *   backButton={{ label: "Back to Projects", onClick: handleBack }}
 * />
 */
const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ 
    className, 
    variant, 
    size, 
    title, 
    description, 
    badge,
    breadcrumbs,
    actions = [], 
    primaryAction,
    backButton,
    tabs,
    meta = [],
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn(pageHeaderVariants({ variant, className }))} {...props}>
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="text-sm">
            {breadcrumbs}
          </div>
        )}

        {/* Back Button */}
        {backButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={backButton.onClick}
            className="p-0 h-auto font-normal text-slate-600 hover:text-slate-800"
          >
            ← {backButton.label || "Back"}
          </Button>
        )}

        {/* Main Header Content */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className={cn(titleVariants({ size }))}>
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant}>
                  {badge.text}
                </Badge>
              )}
            </div>
            
            {description && (
              <p className="text-slate-600 text-sm sm:text-base">
                {description}
              </p>
            )}

            {/* Meta Information */}
            {meta.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-600">
                {meta.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {item.icon}
                    <span className="font-medium">{item.label}:</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          {(actions.length > 0 || primaryAction) && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'outline'}
                  size={action.size || 'default'}
                  disabled={action.disabled}
                  className="flex-shrink-0"
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  <span className="hidden sm:inline">{action.label}</span>
                  <span className="sm:hidden">{action.icon || action.label}</span>
                </Button>
              ))}
              
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  variant={primaryAction.variant || 'default'}
                  size={primaryAction.size || 'default'}
                  disabled={primaryAction.disabled}
                  className={cn(
                    "flex-shrink-0",
                    !primaryAction.variant && "bg-orange-600 hover:bg-orange-700"
                  )}
                >
                  {primaryAction.icon && <span className="mr-2">{primaryAction.icon}</span>}
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        {tabs && (
          <>
            <Separator />
            <div className="overflow-x-auto">
              {tabs}
            </div>
          </>
        )}
      </div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader, pageHeaderVariants, titleVariants };
