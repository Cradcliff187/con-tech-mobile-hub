
import { useState, useEffect } from 'react';
import { useStakeholders, Stakeholder } from '@/hooks/useStakeholders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { PhoneInput } from '@/components/common/PhoneInput';
import { EmailInput } from '@/components/common/EmailInput';
import { useToast } from '@/hooks/use-toast';
import { sanitizeOnSubmit, sanitizeEmailOnSubmit, sanitizePhoneOnSubmit } from '@/utils/iosFriendlyValidation';

interface EditStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
}

export const EditStakeholderDialog = ({ open, onOpenChange, stakeholder }: EditStakeholderDialogProps) => {
  const { updateStakeholder, refetch } = useStakeholders();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    stakeholder_type: 'subcontractor' as 'subcontractor' | 'employee' | 'vendor' | 'client',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    specialties: '',
    crew_size: '',
    license_number: '',
    notes: '',
    status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stakeholder) {
      // Parse legacy address field if structured fields are empty
      let streetAddress = stakeholder.street_address || '';
      let city = stakeholder.city || '';
      let state = stakeholder.state || '';
      let zipCode = stakeholder.zip_code || '';

      // If structured fields are empty but legacy address exists, try to parse it
      if (!streetAddress && !city && !state && !zipCode && stakeholder.address) {
        const addressParts = stakeholder.address.split(', ');
        if (addressParts.length >= 3) {
          streetAddress = addressParts[0] || '';
          city = addressParts[1] || '';
          const lastPart = addressParts[addressParts.length - 1] || '';
          // Try to extract state and zip from last part
          const stateZipMatch = lastPart.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
          if (stateZipMatch) {
            state = stateZipMatch[1];
            zipCode = stateZipMatch[2];
          }
        }
      }

      setFormData({
        stakeholder_type: stakeholder.stakeholder_type,
        company_name: stakeholder.company_name || '',
        contact_person: stakeholder.contact_person || '',
        phone: stakeholder.phone || '',
        email: stakeholder.email || '',
        street_address: streetAddress,
        city: city,
        state: state,
        zip_code: zipCode,
        specialties: stakeholder.specialties ? stakeholder.specialties.join(', ') : '',
        crew_size: stakeholder.crew_size ? stakeholder.crew_size.toString() : '',
        license_number: stakeholder.license_number || '',
        notes: stakeholder.notes || '',
        status: stakeholder.status
      });
      setErrors({});
    }
  }, [stakeholder]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = formData.stakeholder_type === 'employee' ? 'Full name is required' : 'Company name is required';
    }

    if (formData.crew_size && (isNaN(parseInt(formData.crew_size)) || parseInt(formData.crew_size) < 1)) {
      newErrors.crew_size = 'Crew size must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stakeholder || !validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Debug logging - before sanitization
    console.log('=== DEBUG: Form data before sanitization ===');
    console.log('Raw phone value:', JSON.stringify(formData.phone));
    console.log('Raw email value:', JSON.stringify(formData.email));
    console.log('Raw company_name value:', JSON.stringify(formData.company_name));

    // Sanitize all fields - let sanitization functions handle undefined conversion properly
    const sanitizedPhone = sanitizePhoneOnSubmit(formData.phone);
    const sanitizedEmail = sanitizeEmailOnSubmit(formData.email);
    const sanitizedCompanyName = sanitizeOnSubmit(formData.company_name);
    const sanitizedContactPerson = sanitizeOnSubmit(formData.contact_person);
    const sanitizedStreetAddress = sanitizeOnSubmit(formData.street_address);
    const sanitizedCity = sanitizeOnSubmit(formData.city);
    const sanitizedState = sanitizeOnSubmit(formData.state);
    const sanitizedZipCode = sanitizeOnSubmit(formData.zip_code);
    const sanitizedLicenseNumber = sanitizeOnSubmit(formData.license_number);
    const sanitizedNotes = sanitizeOnSubmit(formData.notes);

    // Debug logging - after sanitization
    console.log('=== DEBUG: Values after sanitization ===');
    console.log('Sanitized phone:', JSON.stringify(sanitizedPhone));
    console.log('Sanitized email:', JSON.stringify(sanitizedEmail));
    console.log('Sanitized company_name:', JSON.stringify(sanitizedCompanyName));

    // Build legacy address for backward compatibility
    const legacyAddressParts = [sanitizedStreetAddress, sanitizedCity, sanitizedState, sanitizedZipCode].filter(Boolean);
    const legacyAddress = legacyAddressParts.length > 0 ? legacyAddressParts.join(', ') : undefined;

    // Build update data with explicit NULL handling
    const updatedData = {
      stakeholder_type: formData.stakeholder_type,
      company_name: sanitizedCompanyName,
      contact_person: sanitizedContactPerson,
      phone: sanitizedPhone, // This will be undefined for empty phone, which should convert to NULL
      email: sanitizedEmail, // This will be undefined for empty email, which should convert to NULL
      address: legacyAddress, // Keep for backward compatibility
      street_address: sanitizedStreetAddress,
      city: sanitizedCity,
      state: sanitizedState,
      zip_code: sanitizedZipCode,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => sanitizeOnSubmit(s)).filter(s => s !== undefined) : undefined,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : undefined,
      license_number: sanitizedLicenseNumber,
      notes: sanitizedNotes,
      status: formData.status
    };

    console.log('=== DEBUG: Final update data being sent to database ===');
    console.log('Update data:', JSON.stringify(updatedData, null, 2));
    console.log('Phone field specifically:', JSON.stringify(updatedData.phone));

    try {
      const { error } = await updateStakeholder(stakeholder.id, updatedData);
      
      if (error) {
        console.error('=== DEBUG: Database update error ===', error);
        toast({
          title: "Error",
          description: "Failed to update stakeholder. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('=== DEBUG: Database update successful ===');
        
        // Force a complete refetch to ensure UI reflects database state
        await refetch();
        
        // Verify the update worked by logging what we expect vs what we got
        console.log('=== DEBUG: Refetch completed, dialog should close ===');
        
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Stakeholder updated successfully"
        });
      }
    } catch (error) {
      console.error('=== DEBUG: Unexpected error during update ===', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`=== DEBUG: Field "${field}" changed to:`, JSON.stringify(value));
    // Direct assignment without any sanitization during typing
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!stakeholder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stakeholder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type *</Label>
            <Select 
              value={formData.stakeholder_type} 
              onValueChange={(value: any) => handleInputChange('stakeholder_type', value)}
            >
              <SelectTrigger className="min-h-[44px]">
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

          <div>
            <Label htmlFor="company_name">
              {formData.stakeholder_type === 'employee' ? 'Full Name *' : 'Company Name *'}
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className={`min-h-[44px] ${errors.company_name ? 'border-red-500' : ''}`}
              autoComplete="organization"
              autoCapitalize="words"
              inputMode="text"
            />
            {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
          </div>

          {formData.stakeholder_type !== 'employee' && (
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                className="min-h-[44px]"
                autoComplete="name"
                autoCapitalize="words"
                inputMode="text"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                className="min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to remove phone number</p>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <EmailInput
                value={formData.email}
                onChange={(value) => handleInputChange('email', value)}
                className="min-h-[44px]"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to remove email</p>
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <AddressFormFields
              streetAddress={formData.street_address}
              city={formData.city}
              state={formData.state}
              zipCode={formData.zip_code}
              onFieldChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              className="min-h-[44px]"
              autoCapitalize="words"
              inputMode="text"
            />
          </div>

          {formData.stakeholder_type === 'subcontractor' && (
            <div>
              <Label htmlFor="crew_size">Crew Size</Label>
              <Input
                id="crew_size"
                type="number"
                min="1"
                value={formData.crew_size}
                onChange={(e) => handleInputChange('crew_size', e.target.value)}
                className={`min-h-[44px] ${errors.crew_size ? 'border-red-500' : ''}`}
                inputMode="numeric"
              />
              {errors.crew_size && <p className="text-red-500 text-sm mt-1">{errors.crew_size}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => handleInputChange('license_number', e.target.value)}
              className="min-h-[44px]"
              autoCapitalize="characters"
              inputMode="text"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => handleInputChange('status', value)}
            >
              <SelectTrigger className="min-h-[44px]">
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

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="min-h-[88px]"
              rows={3}
              autoCapitalize="sentences"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Updating...' : 'Update Stakeholder'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
