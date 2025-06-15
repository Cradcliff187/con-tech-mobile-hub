
import { useState, useEffect } from 'react';
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
  defaultType?: 'client' | 'subcontractor' | 'employee' | 'vendor';
  onSuccess?: () => void;
}

export const CreateStakeholderDialog = ({ 
  open, 
  onOpenChange, 
  defaultType,
  onSuccess 
}: CreateStakeholderDialogProps) => {
  const [formData, setFormData] = useState({
    stakeholder_type: defaultType || 'subcontractor' as const,
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    specialties: [] as string[],
    crew_size: '',
    license_number: '',
    insurance_expiry: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createStakeholder } = useStakeholders();
  const { toast } = useToast();

  useEffect(() => {
    if (defaultType) {
      setFormData(prev => ({ ...prev, stakeholder_type: defaultType }));
    }
  }, [defaultType]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const stakeholderData = {
      ...formData,
      crew_size: formData.crew_size ? parseInt(formData.crew_size) : undefined,
      insurance_expiry: formData.insurance_expiry || undefined,
      specialties: formData.specialties.length > 0 ? formData.specialties : undefined
    };

    const { error } = await createStakeholder(stakeholderData);

    if (error) {
      toast({
        title: "Error creating stakeholder",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Stakeholder created successfully",
        description: `${formData.company_name || formData.contact_person} has been added to your directory`
      });
      
      // Reset form
      setFormData({
        stakeholder_type: defaultType || 'subcontractor',
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        specialties: [],
        crew_size: '',
        license_number: '',
        insurance_expiry: '',
        notes: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Add New {formData.stakeholder_type === 'client' ? 'Client' : 'Stakeholder'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder_type">Type *</Label>
              <Select 
                value={formData.stakeholder_type} 
                onValueChange={(value) => handleInputChange('stakeholder_type', value)}
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
                onChange={(e) => handleInputChange('company_name', e.target.value)}
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
                onChange={(e) => handleInputChange('contact_person', e.target.value)}
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
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('phone', e.target.value)}
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
                  onChange={(e) => handleInputChange('crew_size', e.target.value)}
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
              onChange={(e) => handleInputChange('address', e.target.value)}
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
                  onChange={(e) => handleInputChange('license_number', e.target.value)}
                  placeholder="Professional license #"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                <Input
                  id="insurance_expiry"
                  type="date"
                  value={formData.insurance_expiry}
                  onChange={(e) => handleInputChange('insurance_expiry', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional information..."
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
