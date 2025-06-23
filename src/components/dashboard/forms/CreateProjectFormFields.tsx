
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Plus } from 'lucide-react';
import { AddressFormFields } from '@/components/common/AddressFormFields';
import { Stakeholder } from '@/hooks/useStakeholders';
import { LifecycleStatusSelector } from '@/components/ui/lifecycle-status-selector';

interface CreateProjectFormFieldsProps {
  formData: any;
  errors: Record<string, string[]>;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
  clients: Stakeholder[];
  onCreateClient: () => void;
}

export const CreateProjectFormFields = ({
  formData,
  errors,
  onInputChange,
  disabled = false,
  clients,
  onCreateClient
}: CreateProjectFormFieldsProps) => {
  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="client_id">Client *</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 min-w-0">
            <select
              value={formData.client_id || ''}
              onChange={(e) => onInputChange('client_id', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                getFieldError('client_id') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name || client.contact_person}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCreateClient}
            disabled={disabled}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {getFieldError('client_id') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('client_id')}
          </p>
        )}
        {clients.length === 0 && (
          <p className="text-sm text-slate-500">
            No clients found. Click the + button to create a new client.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter project name"
          required
          disabled={disabled}
          className={`w-full ${getFieldError('name') ? 'border-red-500' : ''}`}
        />
        {getFieldError('name') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('name')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe the project"
          rows={3}
          disabled={disabled}
          className={`w-full resize-none ${getFieldError('description') ? 'border-red-500' : ''}`}
        />
        {getFieldError('description') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('description')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lifecycle_status">Project Status</Label>
        <LifecycleStatusSelector
          value={formData.lifecycle_status || 'pre_planning'}
          onValueChange={(value) => onInputChange('lifecycle_status', value)}
          disabled={disabled}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <AddressFormFields
          streetAddress={formData.street_address || ''}
          city={formData.city || ''}
          state={formData.state || ''}
          zipCode={formData.zip_code || ''}
          onFieldChange={onInputChange}
          errors={errors}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => onInputChange('start_date', e.target.value)}
            disabled={disabled}
            className={`w-full ${getFieldError('start_date') ? 'border-red-500' : ''}`}
          />
          {getFieldError('start_date') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('start_date')}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => onInputChange('end_date', e.target.value)}
            disabled={disabled}
            className={`w-full ${getFieldError('end_date') ? 'border-red-500' : ''}`}
          />
          {getFieldError('end_date') && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertTriangle size={12} />
              {getFieldError('end_date')}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Budget</Label>
        <Input
          id="budget"
          type="number"
          value={formData.budget?.toString() || ''}
          onChange={(e) => onInputChange('budget', e.target.value)}
          placeholder="0"
          min="0"
          disabled={disabled}
          className={`w-full ${getFieldError('budget') ? 'border-red-500' : ''}`}
        />
        {getFieldError('budget') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('budget')}
          </p>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors above before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
