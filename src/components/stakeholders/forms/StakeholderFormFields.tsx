import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { PhoneInput } from '@/components/common/PhoneInput';
import { EmailInput } from '@/components/common/EmailInput';

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
}

export const StakeholderFormFields = ({ 
  formData, 
  onInputChange,
  defaultType 
}: StakeholderFormFieldsProps) => {
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subcontractor">Subcontractor</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value) => onInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person *</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => onInputChange('contact_person', e.target.value)}
            placeholder="Primary contact name"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <EmailInput
            value={formData.email}
            onChange={(value) => onInputChange('email', value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => onInputChange('phone', value)}
            placeholder="Phone number"
          />
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
        />
      </div>

      {formData.stakeholder_type === 'subcontractor' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => onInputChange('license_number', e.target.value)}
              placeholder="Professional license #"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
            <Input
              id="insurance_expiry"
              type="date"
              value={formData.insurance_expiry}
              onChange={(e) => onInputChange('insurance_expiry', e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          placeholder="Additional information..."
          rows={3}
        />
      </div>
    </>
  );
};
