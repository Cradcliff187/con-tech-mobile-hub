
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';

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
  return (
    <div className="space-y-2">
      <Label htmlFor="company_name">Company Name</Label>
      <Input
        id="company_name"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
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
