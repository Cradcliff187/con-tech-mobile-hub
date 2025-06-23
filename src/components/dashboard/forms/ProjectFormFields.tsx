
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus } from 'lucide-react';
import { Stakeholder } from '@/hooks/useStakeholders';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import { UnifiedLifecycleStatus } from '@/types/unified-lifecycle';

interface ProjectFormData {
  name: string;
  description: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  budget: string;
  clientId: string;
  unified_lifecycle_status: UnifiedLifecycleStatus;
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
  const handleStatusChange = (newStatus: string) => {
    onInputChange('unified_lifecycle_status', newStatus as UnifiedLifecycleStatus);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="e.g. Office Building Construction"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Client *</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <select
              value={formData.clientId}
              onChange={(e) => onInputChange('clientId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name || client.contact_person || 'Unknown Client'}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCreateClient}
            title="Add new client"
            className="shrink-0"
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
          className="w-full resize-none"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Project Location</Label>
        <AddressFormFields
          streetAddress={formData.street_address}
          city={formData.city}
          state={formData.state}
          zipCode={formData.zip_code}
          onFieldChange={onInputChange}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => onInputChange('budget', e.target.value)}
            placeholder="0"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="unified_lifecycle_status">Project Status</Label>
          <GlobalStatusDropdown
            entityType="project"
            currentStatus={formData.unified_lifecycle_status}
            onStatusChange={handleStatusChange}
            size="md"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => onInputChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endDate">Target Completion</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => onInputChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
