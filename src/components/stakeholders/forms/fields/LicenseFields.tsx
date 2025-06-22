
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { sanitizeText } from '@/utils/validation';
import { type StakeholderFormData } from '@/schemas';

interface LicenseFieldsProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const LicenseFields = ({ 
  formData, 
  onInputChange,
  errors = {}
}: LicenseFieldsProps) => {
  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  const handleSanitizedChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeText(value);
    onInputChange(field, sanitizedValue);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crew_size">Crew Size</Label>
          <Input
            id="crew_size"
            type="number"
            value={formData.crew_size?.toString() || ''}
            onChange={(e) => onInputChange('crew_size', e.target.value)}
            placeholder="Number of crew members"
            min="0"
            max="1000"
            className={getFieldError('crew_size') ? 'border-red-500' : ''}
          />
          {getFieldError('crew_size') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('crew_size')}
            </p>
          )}
        </div>

        {formData.stakeholder_type === 'subcontractor' && (
          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number || ''}
              onChange={(e) => handleSanitizedChange('license_number', e.target.value)}
              placeholder="Professional license # (alphanumeric only)"
              className={getFieldError('license_number') ? 'border-red-500' : ''}
            />
            {getFieldError('license_number') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {getFieldError('license_number')}
              </p>
            )}
          </div>
        )}
      </div>

      {formData.stakeholder_type === 'subcontractor' && (
        <div className="space-y-2">
          <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
          <Input
            id="insurance_expiry"
            type="date"
            value={formData.insurance_expiry || ''}
            onChange={(e) => onInputChange('insurance_expiry', e.target.value)}
            className={getFieldError('insurance_expiry') ? 'border-red-500' : ''}
          />
          {getFieldError('insurance_expiry') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('insurance_expiry')}
            </p>
          )}
        </div>
      )}
    </>
  );
};
