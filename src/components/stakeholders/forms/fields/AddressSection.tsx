
import { Label } from '@/components/ui/label';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { type StakeholderFormData } from '@/schemas';

interface AddressSectionProps {
  formData: StakeholderFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const AddressSection = ({ 
  formData, 
  onInputChange,
  errors = {}
}: AddressSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Address</Label>
      <AddressFormFields
        streetAddress={formData.street_address || ''}
        city={formData.city || ''}
        state={formData.state || ''}
        zipCode={formData.zip_code || ''}
        onFieldChange={onInputChange}
        errors={errors}
      />
    </div>
  );
};
