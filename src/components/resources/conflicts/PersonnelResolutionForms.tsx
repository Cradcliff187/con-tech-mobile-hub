
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ReassignmentFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const ReassignmentForm = ({ notes, onNotesChange }: ReassignmentFormProps) => (
  <div className="space-y-2">
    <Label htmlFor="notes">Reassignment Notes</Label>
    <Textarea
      id="notes"
      placeholder="Describe how tasks will be reassigned..."
      value={notes}
      onChange={(e) => onNotesChange(e.target.value)}
    />
  </div>
);

interface ExtensionFormProps {
  days: number;
  onDaysChange: (days: number) => void;
}

export const ExtensionForm = ({ days, onDaysChange }: ExtensionFormProps) => (
  <div className="space-y-2">
    <Label htmlFor="extension">Extension Days</Label>
    <Input
      id="extension"
      type="number"
      min="1"
      value={days}
      onChange={(e) => onDaysChange(Number(e.target.value))}
      placeholder="Number of days to extend"
    />
  </div>
);

interface ReduceHoursFormProps {
  hours: number;
  onHoursChange: (hours: number) => void;
}

export const ReduceHoursForm = ({ hours, onHoursChange }: ReduceHoursFormProps) => (
  <div className="space-y-2">
    <Label htmlFor="hours">New Hours per Week</Label>
    <Input
      id="hours"
      type="number"
      min="1"
      max="40"
      value={hours}
      onChange={(e) => onHoursChange(Number(e.target.value))}
      placeholder="Reduced hours allocation"
    />
  </div>
);
