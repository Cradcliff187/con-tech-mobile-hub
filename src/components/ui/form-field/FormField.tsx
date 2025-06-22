
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const formFieldVariants = cva(
  "space-y-2",
  {
    variants: {
      variant: {
        default: "",
        compact: "space-y-1",
        spacious: "space-y-3",
      },
      size: {
        sm: "text-sm",
        default: "",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500",
        false: "",
      },
      error: {
        true: "text-red-600",
        false: "text-slate-700",
      },
    },
    defaultVariants: {
      required: false,
      error: false,
    },
  }
);

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

/**
 * FormField - Consistent form field wrapper
 * 
 * @example
 * <FormField label="Project Name" required error={errors.name}>
 *   <Input value={name} onChange={setName} />
 * </FormField>
 * 
 * @example
 * <FormField label="Description" hint="Optional project details">
 *   <Textarea value={description} onChange={setDescription} />
 * </FormField>
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, variant, size, label, required, error, hint, children, ...props }, ref) => {
    const fieldId = React.useId();

    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ variant, size, className }))}
        {...props}
      >
        <Label
          htmlFor={fieldId}
          className={cn(labelVariants({ required, error: !!error }))}
        >
          {label}
        </Label>
        
        <div className="relative">
          {React.cloneElement(children as React.ReactElement, {
            id: fieldId,
            className: cn(
              (children as React.ReactElement).props.className,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500"
            ),
            "aria-invalid": !!error,
            "aria-describedby": error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined,
          })}
        </div>

        {hint && !error && (
          <p id={`${fieldId}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )}

        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-red-600 flex items-center gap-1">
            <span className="inline-block w-3 h-3 text-red-500">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField, formFieldVariants };
