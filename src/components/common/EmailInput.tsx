
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const EmailInput = ({ 
  value, 
  onChange, 
  error,
  className = ""
}: EmailInputProps) => {
  const [validationError, setValidationError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // Enhanced email validation
  const validateEmail = (email: string): string => {
    if (!email) return '';
    
    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    // Domain validation - check for common domains and basic structure
    const domain = email.split('@')[1];
    if (!domain) {
      return 'Please enter a valid email address';
    }

    // Check for valid domain format
    const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return 'Please enter a valid domain name';
    }

    // Check for multiple @ symbols
    if ((email.match(/@/g) || []).length !== 1) {
      return 'Email address can only contain one @ symbol';
    }

    return '';
  };

  // Validate on value change
  useEffect(() => {
    if (isTouched || value) {
      const errorMessage = validateEmail(value);
      setValidationError(errorMessage);
    }
  }, [value, isTouched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const displayError = error || validationError;
  const hasError = Boolean(displayError && isTouched);

  return (
    <div className="space-y-1">
      <Input
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter email address"
        className={`${className} ${hasError ? 'border-red-500 focus:border-red-500' : ''}`}
        autoComplete="email"
      />
      {hasError && (
        <p className="text-sm text-red-600">
          {displayError}
        </p>
      )}
    </div>
  );
};
