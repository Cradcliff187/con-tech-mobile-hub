
import { StakeholderTypeField } from './StakeholderTypeField';
import { StatusField } from './StatusField';
import { CompanyField } from './CompanyField';
import { ContactPersonField } from './ContactPersonField';
import { ContactMethodsFields } from './ContactMethodsFields';
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StakeholderTypeField
          value={formData.stakeholder_type || ''}
          onChange={(value) => onInputChange('stakeholder_type', value)}
          error={getFieldError('stakeholder_type')}
        />
        
        <StatusField
          value={formData.status}
          onChange={(value) => onInputChange('status', value)}
          error={getFieldError('status')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CompanyField
          value={formData.company_name || ''}
          onChange={(value) => onInputChange('company_name', value)}
          error={getFieldError('company_name')}
        />
        
        <ContactPersonField
          value={formData.contact_person}
          onChange={(value) => onInputChange('contact_person', value)}
          error={getFieldError('contact_person')}
        />
      </div>

      <ContactMethodsFields
        email={formData.email || ''}
        phone={formData.phone || ''}
        onEmailChange={(value) => onInputChange('email', value)}
        onPhoneChange={(value) => onInputChange('phone', value)}
        emailError={getFieldError('email')}
        phoneError={getFieldError('phone')}
      />
    </>
  );
};
