
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { US_STATES } from '@/constants/states';
import { AlertTriangle } from 'lucide-react';

interface AddressFormFieldsProps {
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  onFieldChange: (field: string, value: string) => void;
  errors?: Record<string, string[]>;
}

export const AddressFormFields = ({
  streetAddress = '',
  city = '',
  state = '',
  zipCode = '',
  onFieldChange,
  errors = {}
}: AddressFormFieldsProps) => {
  const handleZipCodeChange = (value: string) => {
    // Allow only digits and dash, format as 12345 or 12345-1234
    const cleaned = value.replace(/[^\d-]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 5 && !cleaned.includes('-')) {
      formatted = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 9);
    }
    
    onFieldChange('zip_code', formatted);
  };

  const isValidZipCode = (zip: string) => {
    const zipPattern = /^\d{5}(-\d{4})?$/;
    return zipPattern.test(zip) || zip === '';
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="street_address">Street Address</Label>
        <Input
          id="street_address"
          value={streetAddress}
          onChange={(e) => onFieldChange('street_address', e.target.value)}
          placeholder="123 Main Street"
          className={`mt-1 ${getFieldError('street_address') ? 'border-red-500' : ''}`}
        />
        {getFieldError('street_address') && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('street_address')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onFieldChange('city', e.target.value)}
            placeholder="City"
            className={`mt-1 ${getFieldError('city') ? 'border-red-500' : ''}`}
          />
          {getFieldError('city') && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('city')}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Select value={state} onValueChange={(value) => onFieldChange('state', value)}>
            <SelectTrigger className={`mt-1 ${getFieldError('state') ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60">
              {US_STATES.map((usState) => (
                <SelectItem key={usState.code} value={usState.code}>
                  {usState.code} - {usState.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError('state') && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('state')}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="zip_code">ZIP Code</Label>
        <Input
          id="zip_code"
          value={zipCode}
          onChange={(e) => handleZipCodeChange(e.target.value)}
          placeholder="12345 or 12345-1234"
          className={`mt-1 ${(!isValidZipCode(zipCode) && zipCode) || getFieldError('zip_code') ? 'border-red-500' : ''}`}
          maxLength={10}
        />
        {!isValidZipCode(zipCode) && zipCode && (
          <p className="text-sm text-red-600 mt-1">
            Please enter a valid ZIP code (12345 or 12345-1234)
          </p>
        )}
        {getFieldError('zip_code') && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('zip_code')}
          </p>
        )}
      </div>
    </div>
  );
};
