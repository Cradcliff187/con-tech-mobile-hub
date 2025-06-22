
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { FormField, formFieldVariants } from "./FormField";

export interface TextFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof formFieldVariants> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
}

export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  ({ value, onChange, placeholder, type = 'text', ...props }, ref) => (
    <FormField ref={ref} {...props}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </FormField>
  )
);

TextField.displayName = "TextField";
