
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      variant: {
        default: "py-12",
        compact: "py-8",
        spacious: "py-16",
        card: "py-12",
      },
      size: {
        sm: "max-w-sm mx-auto",
        default: "max-w-md mx-auto",
        lg: "max-w-lg mx-auto",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  icon?: React.ReactNode;
}

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  illustration?: React.ReactNode;
}

/**
 * EmptyState - Consistent empty state component for no-data scenarios
 * 
 * @example Basic usage
 * <EmptyState
 *   icon={<FileText size={48} />}
 *   title="No Documents Found"
 *   description="Upload your first document to get started."
 *   actions={[
 *     { label: "Upload Document", onClick: handleUpload, icon: <Plus size={16} /> }
 *   ]}
 * />
 * 
 * @example Card variant
 * <EmptyState
 *   variant="card"
 *   icon={<Users size={48} />}
 *   title="No Team Members"
 *   description="Invite team members to collaborate on this project."
 *   actions={[
 *     { label: "Invite Members", onClick: handleInvite },
 *     { label: "Learn More", onClick: handleLearnMore, variant: "outline" }
 *   ]}
 * />
 * 
 * @example With custom illustration
 * <EmptyState
 *   illustration={<CustomIllustration />}
 *   title="Construction Complete"
 *   description="All tasks have been completed successfully."
 * />
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    className, 
    variant, 
    size, 
    icon, 
    title, 
    description, 
    actions = [], 
    illustration,
    ...props 
  }, ref) => {
    const content = (
      <div className={cn(emptyStateVariants({ variant: variant === 'card' ? 'default' : variant, size, className }))}>
        {/* Icon or Illustration */}
        <div className="mb-4 flex justify-center">
          {illustration || (
            <div className="text-slate-400">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-semibold text-slate-800">
            {title}
          </h3>
          <p className="text-slate-600 text-sm sm:text-base max-w-prose">
            {description}
          </p>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || (index === 0 ? 'default' : 'outline')}
                className={cn(
                  "w-full sm:w-auto",
                  index === 0 && !action.variant && "bg-orange-600 hover:bg-orange-700"
                )}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );

    if (variant === 'card') {
      return (
        <Card ref={ref} className={className} {...props}>
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>
      );
    }

    return (
      <div ref={ref} className={className} {...props}>
        {content}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

// Predefined empty states for common scenarios
export const NoDataEmptyState = ({ onAction, actionLabel = "Add Data" }: { 
  onAction?: () => void; 
  actionLabel?: string; 
}) => (
  <EmptyState
    icon={<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">📁</div>}
    title="No Data Available"
    description="There's nothing to show here yet."
    actions={onAction ? [{ label: actionLabel, onClick: onAction }] : []}
  />
);

export const NoSearchResultsEmptyState = ({ 
  searchTerm, 
  onClearSearch 
}: { 
  searchTerm: string; 
  onClearSearch?: () => void; 
}) => (
  <EmptyState
    icon={<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">🔍</div>}
    title="No Results Found"
    description={`No results found for "${searchTerm}". Try adjusting your search terms.`}
    actions={onClearSearch ? [{ label: "Clear Search", onClick: onClearSearch, variant: "outline" }] : []}
    variant="compact"
  />
);

export const ErrorEmptyState = ({ 
  onRetry, 
  errorMessage = "Something went wrong" 
}: { 
  onRetry?: () => void; 
  errorMessage?: string; 
}) => (
  <EmptyState
    icon={<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">⚠️</div>}
    title="Error"
    description={errorMessage}
    actions={onRetry ? [{ label: "Try Again", onClick: onRetry }] : []}
    variant="compact"
  />
);

export const LoadingEmptyState = ({ message = "Loading..." }: { message?: string }) => (
  <EmptyState
    icon={<div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center animate-pulse">⏳</div>}
    title={message}
    description="Please wait while we load your data."
    variant="compact"
  />
);

export { EmptyState, emptyStateVariants };
