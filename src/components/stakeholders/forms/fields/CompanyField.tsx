
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { sanitizeText } from '@/utils/validation';

interface CompanyFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CompanyField = ({ 
  value, 
  onChange, 
  error 
}: CompanyFieldProps) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeText(e.target.value);
    if (sanitizedValue !== e.target.value) {
      onChange(sanitizedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="company_name">Company Name</Label>
      <Input
        id="company_name"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="Enter company name"
        className={error ? 'border-red-500' : ''}
        autoComplete="organization"
        autoCapitalize="words"
        inputMode="text"
      />
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};
