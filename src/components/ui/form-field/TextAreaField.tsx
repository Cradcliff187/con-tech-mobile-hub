
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Textarea } from "@/components/ui/textarea";
import { FormField, formFieldVariants } from "./FormField";

export interface TextAreaFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof formFieldVariants> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TextAreaField = React.forwardRef<HTMLDivElement, TextAreaFieldProps>(
  ({ value, onChange, placeholder, rows = 3, ...props }, ref) => (
    <FormField ref={ref} {...props}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </FormField>
  )
);

TextAreaField.displayName = "TextAreaField";
