
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Stakeholder } from '@/hooks/useStakeholders';

interface AssignmentFormFieldsProps {
  formData: {
    role: string;
    start_date: string;
    end_date: string;
    hourly_rate: string;
    notes: string;
  };
  onChange: (field: string, value: string) => void;
  stakeholder?: Stakeholder;
}

export const AssignmentFormFields = ({ 
  formData, 
  onChange, 
  stakeholder 
}: AssignmentFormFieldsProps) => {
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
