
import { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStakeholderDialog = ({ open, onOpenChange }: CreateStakeholderDialogProps) => {
  const { createStakeholder } = useStakeholders();
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
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stakeholderData = {
      ...formData,
      specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : null
    };

    const { error } = await createStakeholder(stakeholderData);
    
    if (!error) {
      setFormData({
        stakeholder_type: 'subcontractor',
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stakeholder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select 
              value={formData.stakeholder_type} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, stakeholder_type: value }))}
            >
              <SelectTrigger>
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
              {formData.stakeholder_type === 'employee' ? 'Full Name' : 'Company Name'}
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
              required
            />
          </div>

          {formData.stakeholder_type !== 'employee' && (
            <div>
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="specialties">Specialties (comma-separated)</Label>
            <Input
              id="specialties"
              placeholder="Excavation, Concrete, Electrical..."
              value={formData.specialties}
              onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, crew_size: e.target.value }))}
              />
            </div>
          )}

          <div>
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Stakeholder'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
