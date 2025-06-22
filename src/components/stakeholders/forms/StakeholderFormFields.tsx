
import { ContactInfoFields } from './fields/ContactInfoFields';
import { AddressSection } from './fields/AddressSection';
import { SpecialtiesManager } from './fields/SpecialtiesManager';
import { LicenseFields } from './fields/LicenseFields';
import { NotesField } from './fields/NotesField';
import { ValidationSummary } from './fields/ValidationSummary';
import { type StakeholderFormData } from '@/schemas';

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
  return (
    <>
      <ContactInfoFields
        formData={formData}
        onInputChange={onInputChange}
        defaultType={defaultType}
        errors={errors}
      />

      <AddressSection
        formData={formData}
        onInputChange={onInputChange}
        errors={errors}
      />

      <SpecialtiesManager
        formData={formData}
        onInputChange={onInputChange}
        errors={errors}
      />

      <LicenseFields
        formData={formData}
        onInputChange={onInputChange}
        errors={errors}
      />

      <NotesField
        formData={formData}
        onInputChange={onInputChange}
        errors={errors}
      />

      <ValidationSummary errors={errors} />
    </>
  );
};
