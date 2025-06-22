
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { AddressFormFields } from '@/components/common/AddressFormFields';

interface CreateProjectFormFieldsProps {
  formData: any;
  errors: Record<string, string[]>;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const CreateProjectFormFields = ({
  formData,
  errors,
  onInputChange,
  disabled = false
}: CreateProjectFormFieldsProps) => {
  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Enter project name"
          required
          disabled={disabled}
          className={getFieldError('name') ? 'border-red-500' : ''}
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
          className={getFieldError('description') ? 'border-red-500' : ''}
        />
        {getFieldError('description') && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle size={12} />
            {getFieldError('description')}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={formData.status || 'planning'} 
            onValueChange={(value) => onInputChange('status', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phase">Phase</Label>
          <Select 
            value={formData.phase || 'planning'} 
            onValueChange={(value) => onInputChange('phase', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="punch_list">Punch List</SelectItem>
              <SelectItem value="closeout">Closeout</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AddressFormFields
        formData={formData}
        onInputChange={onInputChange}
        errors={errors}
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => onInputChange('start_date', e.target.value)}
            disabled={disabled}
            className={getFieldError('start_date') ? 'border-red-500' : ''}
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
            className={getFieldError('end_date') ? 'border-red-500' : ''}
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
          className={getFieldError('budget') ? 'border-red-500' : ''}
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
    </>
  );
};
