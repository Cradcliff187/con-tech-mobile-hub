
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, formFieldVariants } from "./FormField";

export interface SelectFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof formFieldVariants> {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const SelectField = React.forwardRef<HTMLDivElement, SelectFieldProps>(
  ({ value, onChange, placeholder, options, ...props }, ref) => (
    <FormField ref={ref} {...props}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  )
);

SelectField.displayName = "SelectField";
