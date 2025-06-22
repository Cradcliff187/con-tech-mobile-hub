
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stakeholder } from '@/hooks/useStakeholders';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle } from 'lucide-react';

interface AssignmentFormFieldsProps {
  formData: {
    role: string;
    start_date: string;
    end_date: string;
    hourly_rate: string;
    total_hours: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  stakeholder?: Stakeholder;
  estimatedCost?: number;
  estimatedHoursFromDuration?: number;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
}

export const AssignmentFormFields = ({ 
  formData, 
  onChange, 
  stakeholder,
  estimatedCost = 0,
  estimatedHoursFromDuration = 0,
  validation
}: AssignmentFormFieldsProps) => {
  const isEmployee = stakeholder?.stakeholder_type === 'employee';

  return (
    <>
      <div>
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={formData.role}
          onChange={(e) => onChange('role', e.target.value)}
          className="min-h-[44px]"
          placeholder="e.g., Site Supervisor, Equipment Operator, Supplier"
        />
        {formData.role && (
          <p className="text-xs text-green-600 mt-1">
            Role suggested based on skills and project phase
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => onChange('start_date', e.target.value)}
            className="min-h-[44px]"
          />
        </div>
        
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => onChange('end_date', e.target.value)}
            className="min-h-[44px]"
            min={formData.start_date}
          />
        </div>
      </div>

      {/* Employee-specific cost fields */}
      {isEmployee && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly_rate">
                Hourly Rate ($) *
              </Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => onChange('hourly_rate', e.target.value)}
                className="min-h-[44px]"
                placeholder="0.00"
                required
              />
              {validation?.errors.includes('Hourly rate is required for employees') && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Hourly rate is required for employees
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="total_hours">
                Total Hours *
              </Label>
              <Input
                id="total_hours"
                type="number"
                min="0"
                value={formData.total_hours}
                onChange={(e) => onChange('total_hours', e.target.value)}
                className="min-h-[44px]"
                placeholder="0"
                required
              />
              {estimatedHoursFromDuration > 0 && !formData.total_hours && (
                <p className="text-xs text-blue-600 mt-1">
                  Estimated: {estimatedHoursFromDuration} hours based on duration
                </p>
              )}
              {validation?.errors.includes('Total hours is required for employees') && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Total hours is required for employees
                </p>
              )}
            </div>
          </div>

          {/* Cost Preview */}
          {(formData.hourly_rate || formData.total_hours) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator size={16} className="text-blue-600" />
                <span className="font-medium text-blue-800">Cost Impact Preview</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hours:</span>
                  <span className="font-medium">{formData.total_hours || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Rate:</span>
                  <span className="font-medium">${formData.hourly_rate || '0'}/hr</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-slate-700 font-medium">Estimated Total Cost:</span>
                  <Badge variant="default" className="bg-blue-600">
                    ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Non-employee hourly rate field (optional) */}
      {!isEmployee && (
        <div>
          <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
          <Input
            id="hourly_rate"
            type="number"
            step="0.01"
            min="0"
            value={formData.hourly_rate}
            onChange={(e) => onChange('hourly_rate', e.target.value)}
            className="min-h-[44px]"
            placeholder="0.00"
          />
          {formData.hourly_rate && stakeholder && (
            <p className="text-xs text-green-600 mt-1">
              Rate suggested based on stakeholder type: {stakeholder.stakeholder_type}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="notes">Assignment Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          className="min-h-[88px]"
          placeholder="Special instructions, requirements, or notes for this assignment..."
          rows={3}
        />
      </div>
    </>
  );
};
