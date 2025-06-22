
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailInput } from '@/components/common/EmailInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { AlertTriangle } from 'lucide-react';
import { sanitizeText } from '@/utils/validation';
import { type StakeholderFormData } from '@/schemas';

interface ContactInfoFieldsProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  errors?: Record<string, string[]>;
}

export const ContactInfoFields = ({ 
  formData, 
  onInputChange,
  defaultType,
  errors = {}
}: ContactInfoFieldsProps) => {
  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
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
            value={formData.company_name || ''}
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
            value={formData.email || ''}
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
            value={formData.phone || ''}
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
    </>
  );
};
