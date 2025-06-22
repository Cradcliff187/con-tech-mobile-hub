
import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { ProjectFormData } from '@/schemas';
import { useStakeholders } from '@/hooks/useStakeholders';

interface CreateProjectFormFieldsProps {
  formData: Partial<ProjectFormData>;
  errors: Record<string, string[]>;
  onInputChange: (field: keyof ProjectFormData, value: string) => void;
}

export const CreateProjectFormFields = ({ 
  formData, 
  errors, 
  onInputChange 
}: CreateProjectFormFieldsProps) => {
  const { stakeholders } = useStakeholders();
  
  // Filter stakeholders to get clients only
  const clients = stakeholders.filter(s => s.stakeholder_type === 'client');

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'critical', label: 'Critical Priority' }
  ];

  const statusOptions = [
    { value: 'planning', label: 'Planning Phase' },
    { value: 'active', label: 'Active Construction' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.company_name || client.contact_person || 'Unknown Client'
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Project Name"
          required
          value={formData.name || ''}
          onChange={(value) => onInputChange('name', value)}
          placeholder="Enter project name"
          error={errors.name?.[0]}
          hint="Maximum 100 characters"
        />
        
        <SelectField
          label="Client"
          required
          value={formData.client_id || ''}
          onChange={(value) => onInputChange('client_id', value)}
          options={clientOptions}
          placeholder="Select client"
          error={errors.client_id?.[0]}
        />
      </div>

      <TextAreaField
        label="Description"
        value={formData.description || ''}
        onChange={(value) => onInputChange('description', value)}
        placeholder="Project description (optional)"
        hint="Provide details about the construction project (max 2,000 characters)"
        rows={4}
        error={errors.description?.[0]}
      />

      <div className="space-y-4">
        <h4 className="font-medium text-slate-700">Project Location</h4>
        <div className="grid grid-cols-1 gap-4">
          <TextField
            label="Street Address"
            value={formData.street_address || ''}
            onChange={(value) => onInputChange('street_address', value)}
            placeholder="123 Main Street"
            error={errors.street_address?.[0]}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="City"
              value={formData.city || ''}
              onChange={(value) => onInputChange('city', value)}
              placeholder="City name"
              error={errors.city?.[0]}
            />
            
            <TextField
              label="State"
              value={formData.state || ''}
              onChange={(value) => onInputChange('state', value)}
              placeholder="State"
              error={errors.state?.[0]}
            />
            
            <TextField
              label="ZIP Code"
              value={formData.zip_code || ''}
              onChange={(value) => onInputChange('zip_code', value)}
              placeholder="12345"
              error={errors.zip_code?.[0]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Budget ($)"
          type="text"
          value={typeof formData.budget === 'number' ? formData.budget.toString() : (formData.budget || '')}
          onChange={(value) => onInputChange('budget', value)}
          placeholder="0"
          hint="Project budget in USD"
          error={errors.budget?.[0]}
        />
        
        <SelectField
          label="Priority"
          value={formData.priority || 'medium'}
          onChange={(value) => onInputChange('priority', value)}
          options={priorityOptions}
          placeholder="Select priority level"
          error={errors.priority?.[0]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Initial Status"
          value={formData.status || 'planning'}
          onChange={(value) => onInputChange('status', value)}
          options={statusOptions}
          placeholder="Select initial status"
          error={errors.status?.[0]}
        />
        
        <TextField
          label="Start Date"
          type="text"
          value={formData.start_date || ''}
          onChange={(value) => onInputChange('start_date', value)}
          placeholder="YYYY-MM-DD"
          hint="Format: YYYY-MM-DD"
          error={errors.start_date?.[0]}
        />
        
        <TextField
          label="Target Completion"
          type="text"
          value={formData.end_date || ''}
          onChange={(value) => onInputChange('end_date', value)}
          placeholder="YYYY-MM-DD"
          hint="Format: YYYY-MM-DD"
          error={errors.end_date?.[0]}
        />
      </div>

      {clients.length === 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            No clients available. Please create a client first before creating a project.
          </p>
        </div>
      )}
    </div>
  );
};
