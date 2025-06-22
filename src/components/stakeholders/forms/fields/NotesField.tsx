
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { sanitizeText } from '@/utils/validation';
import { type StakeholderFormData } from '@/schemas';

interface NotesFieldProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const NotesField = ({ 
  formData, 
  onInputChange,
  errors = {}
}: NotesFieldProps) => {
  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  const handleSanitizedChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeText(value);
    onInputChange(field, sanitizedValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        value={formData.notes || ''}
        onChange={(e) => handleSanitizedChange('notes', e.target.value)}
        placeholder="Additional information (max 2,000 characters)"
        rows={3}
        className={getFieldError('notes') ? 'border-red-500' : ''}
      />
      {getFieldError('notes') && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle size={12} />
          {getFieldError('notes')}
        </p>
      )}
    </div>
  );
};
