
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { PhoneInput } from '@/components/common/PhoneInput';
import { EmailInput } from '@/components/common/EmailInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { sanitizeText, sanitizeStringArray } from '@/utils/validation';
import { useState } from 'react';

interface StakeholderFormData {
  stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  specialties: string[];
  crew_size: string;
  license_number: string;
  insurance_expiry: string;
  notes: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

interface StakeholderFormFieldsProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  errors?: Record<string, string[]>;
}

export const StakeholderFormFields = ({ 
  formData, 
  onInputChange,
  defaultType,
  errors = {}
}: StakeholderFormFieldsProps) => {
  const [newSpecialty, setNewSpecialty] = useState('');

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  const handleAddSpecialty = () => {
    const sanitizedSpecialty = sanitizeText(newSpecialty);
    if (sanitizedSpecialty && !formData.specialties.includes(sanitizedSpecialty)) {
      const updatedSpecialties = sanitizeStringArray([...formData.specialties, sanitizedSpecialty]);
      onInputChange('specialties', updatedSpecialties);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialtyToRemove: string) => {
    const updatedSpecialties = formData.specialties.filter(spec => spec !== specialtyToRemove);
    onInputChange('specialties', updatedSpecialties);
  };

  const handleSanitizedChange = (field: string, value: string, sanitizeType: 'text' | 'email' | 'phone' = 'text') => {
    let sanitizedValue = value;
    
    switch (sanitizeType) {
      case 'email':
        sanitizedValue = value.trim().toLowerCase();
        break;
      case 'phone':
        sanitizedValue = value.replace(/[^0-9\s\-\(\)\+]/g, '');
        break;
      case 'text':
      default:
        sanitizedValue = sanitizeText(value);
        break;
    }
    
    onInputChange(field, sanitizedValue);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stakeholder_type">Type *</Label>
          <Select 
            value={formData.stakeholder_type} 
            onValueChange={(value) => onInputChange('stakeholder_type', value)}
            disabled={!!defaultType}
          >
            <SelectTrigger className={getFieldError('stakeholder_type') ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('stakeholder_type') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('stakeholder_type')}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => onInputChange('status', value)}
          >
            <SelectTrigger className={getFieldError('status') ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          {getFieldError('status') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('status')}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleSanitizedChange('company_name', e.target.value)}
            placeholder="Enter company name (max 200 characters)"
            className={getFieldError('company_name') ? 'border-red-500' : ''}
          />
          {getFieldError('company_name') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('company_name')}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleSanitizedChange('contact_person', e.target.value)}
            placeholder="Primary contact name (max 100 characters)"
            required
            className={getFieldError('contact_person') ? 'border-red-500' : ''}
          />
          {getFieldError('contact_person') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('contact_person')}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <EmailInput
            value={formData.email}
            onChange={(value) => handleSanitizedChange('email', value, 'email')}
            className={getFieldError('email') ? 'border-red-500' : ''}
          />
          {getFieldError('email') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('email')}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => handleSanitizedChange('phone', value, 'phone')}
            placeholder="Phone number"
            className={getFieldError('phone') ? 'border-red-500' : ''}
          />
          {getFieldError('phone') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('phone')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <AddressFormFields
          streetAddress={formData.street_address}
          city={formData.city}
          state={formData.state}
          zipCode={formData.zip_code}
          onFieldChange={onInputChange}
          errors={errors}
        />
      </div>

      <div className="space-y-2">
        <Label>Specialties</Label>
        <div className="flex gap-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add specialty (max 50 characters)"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
          />
          <Button type="button" onClick={handleAddSpecialty} variant="outline">
            Add
          </Button>
        </div>
        {formData.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                {specialty}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleRemoveSpecialty(specialty)}
                />
              </Badge>
            ))}
          </div>
        )}
        {getFieldError('specialties') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('specialties')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="crew_size">Crew Size</Label>
          <Input
            id="crew_size"
            type="number"
            value={formData.crew_size}
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
              value={formData.license_number}
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
            value={formData.insurance_expiry}
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

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
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

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors above. All inputs are sanitized for security.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
