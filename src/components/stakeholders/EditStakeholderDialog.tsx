
import { useState, useEffect } from 'react';
import { useStakeholders, Stakeholder } from '@/hooks/useStakeholders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EditStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
}

export const EditStakeholderDialog = ({ open, onOpenChange, stakeholder }: EditStakeholderDialogProps) => {
  const { updateStakeholder } = useStakeholders();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    stakeholder_type: 'subcontractor' as 'subcontractor' | 'employee' | 'vendor',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
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
      setFormData({
        stakeholder_type: stakeholder.stakeholder_type,
        company_name: stakeholder.company_name || '',
        contact_person: stakeholder.contact_person || '',
        phone: stakeholder.phone || '',
        email: stakeholder.email || '',
        address: stakeholder.address || '',
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
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

    const updatedData = {
      stakeholder_type: formData.stakeholder_type,
      company_name: formData.company_name.trim(),
      contact_person: formData.contact_person.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(s => s) : undefined,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : undefined,
      license_number: formData.license_number.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      status: formData.status
    };

    const { error } = await updateStakeholder(stakeholder.id, updatedData);
    
    if (!error) {
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Stakeholder updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
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
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`min-h-[44px] ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`min-h-[44px] ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              className="min-h-[44px]"
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
