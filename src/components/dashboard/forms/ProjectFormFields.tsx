
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { Stakeholder } from '@/hooks/useStakeholders';

interface ProjectFormData {
  name: string;
  description: string;
  location: string;
  budget: string;
  clientId: string;
  status: 'planning' | 'active';
  startDate: string;
  endDate: string;
}

interface ProjectFormFieldsProps {
  formData: ProjectFormData;
  onInputChange: (field: string, value: any) => void;
  clients: Stakeholder[];
  onCreateClient: () => void;
}

export const ProjectFormFields = ({ 
  formData, 
  onInputChange, 
  clients, 
  onCreateClient 
}: ProjectFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g. Office Building Construction"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Client *</Label>
        <div className="flex gap-2">
          <Select value={formData.clientId} onValueChange={(value) => onInputChange('clientId', value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company_name || client.contact_person || 'Unknown Client'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCreateClient}
            title="Add new client"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {clients.length === 0 && (
          <Alert>
            <AlertDescription>
              No clients available. Click the + button to create a client first.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Brief description of the project scope and objectives"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder="Project site address or location"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => onInputChange('budget', e.target.value)}
            placeholder="0"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: 'planning' | 'active') => onInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onInputChange('startDate', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Target Completion</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onInputChange('endDate', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
