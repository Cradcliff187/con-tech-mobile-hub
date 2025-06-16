
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PhoneInput = ({ 
  value, 
  onChange, 
  placeholder = "Phone number",
  className = ""
}: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format phone number as (###) ###-####
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digits
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Apply formatting based on length
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  // Extract clean digits from phone number
  const getCleanDigits = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, '');
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cleaned = getCleanDigits(input);
    
    // Limit to 10 digits
    if (cleaned.length <= 10) {
      const formatted = formatPhoneNumber(input);
      setDisplayValue(formatted);
      onChange(cleaned); // Store clean digits
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      maxLength={14} // (###) ###-####
    />
  );
};
