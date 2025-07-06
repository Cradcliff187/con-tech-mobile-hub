import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { useStakeholders } from '@/hooks/useStakeholders';
import type { EstimateFormData } from '../hooks/useEstimateForm';

interface EstimateFormFieldsProps {
  formData: EstimateFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
}

export const EstimateFormFields = ({ 
  formData, 
  onInputChange,
  errors = {}
}: EstimateFormFieldsProps) => {
  const { stakeholders } = useStakeholders();

  const stakeholderOptions = stakeholders.map(stakeholder => ({
    value: stakeholder.id,
    label: stakeholder.company_name || stakeholder.contact_person
  }));

  const handleAmountChange = () => {
    const labor = parseFloat(formData.labor_cost?.toString() || '0') || 0;
    const material = parseFloat(formData.material_cost?.toString() || '0') || 0;
    const equipment = parseFloat(formData.equipment_cost?.toString() || '0') || 0;
    const markup = parseFloat(formData.markup_percentage?.toString() || '0') || 0;
    
    const subtotal = labor + material + equipment;
    const markupAmount = subtotal * (markup / 100);
    const total = subtotal + markupAmount;
    
    onInputChange('amount', total);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Basic Information</h3>
        
        <SelectField
          label="Stakeholder"
          required
          value={formData.stakeholder_id}
          onChange={(value) => onInputChange('stakeholder_id', value)}
          options={stakeholderOptions}
          placeholder="Select stakeholder"
          error={errors.stakeholder_id?.[0]}
        />

        <TextField
          label="Estimate Title"
          required
          value={formData.title}
          onChange={(value) => onInputChange('title', value)}
          placeholder="e.g., Kitchen Renovation Project"
          error={errors.title?.[0]}
        />

        <TextAreaField
          label="Description"
          value={formData.description || ''}
          onChange={(value) => onInputChange('description', value)}
          placeholder="Detailed description of work to be performed"
          rows={3}
          error={errors.description?.[0]}
        />
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Cost Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Labor Cost"
            type="number"
            value={formData.labor_cost?.toString() || ''}
            onChange={(value) => {
              onInputChange('labor_cost', parseFloat(value) || 0);
              setTimeout(handleAmountChange, 0);
            }}
            placeholder="0"
            error={errors.labor_cost?.[0]}
          />

          <TextField
            label="Material Cost"
            type="number"
            value={formData.material_cost?.toString() || ''}
            onChange={(value) => {
              onInputChange('material_cost', parseFloat(value) || 0);
              setTimeout(handleAmountChange, 0);
            }}
            placeholder="0"
            error={errors.material_cost?.[0]}
          />

          <TextField
            label="Equipment Cost"
            type="number"
            value={formData.equipment_cost?.toString() || ''}
            onChange={(value) => {
              onInputChange('equipment_cost', parseFloat(value) || 0);
              setTimeout(handleAmountChange, 0);
            }}
            placeholder="0"
            error={errors.equipment_cost?.[0]}
          />

          <TextField
            label="Markup Percentage"
            type="number"
            value={formData.markup_percentage?.toString() || ''}
            onChange={(value) => {
              onInputChange('markup_percentage', parseFloat(value) || 0);
              setTimeout(handleAmountChange, 0);
            }}
            placeholder="0"
            hint="Profit margin percentage"
            error={errors.markup_percentage?.[0]}
          />
        </div>

        <TextField
          label="Total Amount"
          type="number"
          required
          value={formData.amount.toString()}
          onChange={(value) => onInputChange('amount', parseFloat(value) || 0)}
          placeholder="0"
          hint="This will be calculated automatically based on cost breakdown"
          error={errors.amount?.[0]}
        />
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Terms and Conditions</h3>
        
        <TextField
          label="Valid Until"
          type="date"
          value={formData.valid_until || ''}
          onChange={(value) => onInputChange('valid_until', value)}
          error={errors.valid_until?.[0]}
        />

        <TextAreaField
          label="Terms and Conditions"
          value={formData.terms_and_conditions || ''}
          onChange={(value) => onInputChange('terms_and_conditions', value)}
          placeholder="Payment terms, warranty information, project timeline, etc."
          rows={4}
          error={errors.terms_and_conditions?.[0]}
        />

        <TextAreaField
          label="Notes"
          value={formData.notes || ''}
          onChange={(value) => onInputChange('notes', value)}
          placeholder="Additional notes or special instructions"
          rows={3}
          error={errors.notes?.[0]}
        />
      </div>
    </div>
  );
};