import { TextField, TextAreaField, SelectField } from '@/components/ui/form-field';
import { useEstimates } from '@/hooks/useEstimates';
import type { BidFormData } from '../hooks/useBidForm';

interface BidFormFieldsProps {
  formData: BidFormData;
  onInputChange: (field: string, value: any) => void;
  errors?: Record<string, string[]>;
  isFromEstimate?: boolean;
}

export const BidFormFields = ({ 
  formData, 
  onInputChange,
  errors = {},
  isFromEstimate = false
}: BidFormFieldsProps) => {
  const { estimates } = useEstimates();

  const estimateOptions = estimates.map(estimate => ({
    value: estimate.id,
    label: `${estimate.estimate_number} - ${estimate.title}`
  }));

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Basic Information</h3>
        
        {!isFromEstimate && (
          <SelectField
            label="Source Estimate (Optional)"
            value={formData.estimate_id || ''}
            onChange={(value) => onInputChange('estimate_id', value || undefined)}
            options={estimateOptions}
            placeholder="Select estimate (optional)"
            error={errors.estimate_id?.[0]}
            hint="Link this bid to an existing estimate"
          />
        )}

        <TextField
          label="Bid Amount"
          type="number"
          required
          value={formData.bid_amount.toString()}
          onChange={(value) => onInputChange('bid_amount', parseFloat(value) || 0)}
          placeholder="0"
          error={errors.bid_amount?.[0]}
        />

        <SelectField
          label="Status"
          required
          value={formData.status}
          onChange={(value) => onInputChange('status', value)}
          options={statusOptions}
          error={errors.status?.[0]}
        />
      </div>

      {/* Competition Analysis */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Competition Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Number of Competitors"
            type="number"
            value={formData.competitor_count?.toString() || ''}
            onChange={(value) => onInputChange('competitor_count', parseInt(value) || 0)}
            placeholder="0"
            error={errors.competitor_count?.[0]}
          />

          <TextField
            label="Win Probability (%)"
            type="number"
            value={formData.win_probability?.toString() || ''}
            onChange={(value) => onInputChange('win_probability', parseFloat(value) || 0)}
            placeholder="0"
            hint="Estimated chance of winning"
            error={errors.win_probability?.[0]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Estimated Competition Range (Low)"
            type="number"
            value={formData.estimated_competition_range_low?.toString() || ''}
            onChange={(value) => onInputChange('estimated_competition_range_low', parseFloat(value) || 0)}
            placeholder="0"
            error={errors.estimated_competition_range_low?.[0]}
          />

          <TextField
            label="Estimated Competition Range (High)"
            type="number"
            value={formData.estimated_competition_range_high?.toString() || ''}
            onChange={(value) => onInputChange('estimated_competition_range_high', parseFloat(value) || 0)}
            placeholder="0"
            error={errors.estimated_competition_range_high?.[0]}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Important Dates</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Submission Date"
            type="date"
            value={formData.submission_date || ''}
            onChange={(value) => onInputChange('submission_date', value)}
            error={errors.submission_date?.[0]}
          />

          <TextField
            label="Decision Date"
            type="date"
            value={formData.decision_date || ''}
            onChange={(value) => onInputChange('decision_date', value)}
            error={errors.decision_date?.[0]}
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Additional Information</h3>
        
        <TextAreaField
          label="Win/Loss Reason"
          value={formData.win_loss_reason || ''}
          onChange={(value) => onInputChange('win_loss_reason', value)}
          placeholder="Reason for winning or losing the bid"
          rows={3}
          error={errors.win_loss_reason?.[0]}
        />

        <TextAreaField
          label="Notes"
          value={formData.notes || ''}
          onChange={(value) => onInputChange('notes', value)}
          placeholder="Additional notes about this bid"
          rows={3}
          error={errors.notes?.[0]}
        />
      </div>
    </div>
  );
};