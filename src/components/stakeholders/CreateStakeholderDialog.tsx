
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';

interface CreateStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStakeholderDialog = ({ open, onOpenChange }: CreateStakeholderDialogProps) => {
  const [formData, setFormData] = useState({
    stakeholder_type: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    specialties: '',
    crew_size: '',
    license_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stakeholderData = {
      stakeholder_type: formData.stakeholder_type as 'subcontractor' | 'employee' | 'vendor' | 'client',
      company_name: formData.company_name || undefined,
      contact_person: formData.contact_person || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : undefined,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : undefined,
      license_number: formData.license_number || undefined,
      notes: formData.notes || undefined,
      status: 'active' as const
    };

    const { error } = await createStakeholder(stakeholderData);

    if (!error) {
      // Reset form
      setFormData({
        stakeholder_type: '',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        specialties: '',
        crew_size: '',
        license_number: '',
        notes: ''
      });
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stakeholder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder_type">Type *</Label>
              <Select value={formData.stakeholder_type} onValueChange={(value) => handleInputChange('stakeholder_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="vendor">Vendor/Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_name">Company/Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="crew_size">Crew Size</Label>
              <Input
                id="crew_size"
                type="number"
                value={formData.crew_size}
                onChange={(e) => handleInputChange('crew_size', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange('specialties', e.target.value)}
              placeholder="e.g. Electrical, Plumbing, HVAC"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => handleInputChange('license_number', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Stakeholder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
