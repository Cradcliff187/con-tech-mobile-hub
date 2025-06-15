
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StakeholderFormData {
  stakeholder_type: 'client' | 'subcontractor' | 'employee' | 'vendor';
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  specialties: string[];
  crew_size: string;
  license_number: string;
  insurance_expiry: string;
  notes: string;
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
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => onInputChange('company_name', e.target.value)}
            placeholder="Enter company name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder="contact@company.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        
        {formData.stakeholder_type === 'subcontractor' && (
          <div className="space-y-2">
            <Label htmlFor="crew_size">Crew Size</Label>
            <Input
              id="crew_size"
              type="number"
              value={formData.crew_size}
              onChange={(e) => onInputChange('crew_size', e.target.value)}
              placeholder="Number of workers"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          placeholder="Full business address"
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
