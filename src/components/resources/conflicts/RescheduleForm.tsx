
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RescheduleFormProps {
  onSubmit: (data: { newStartDate: string; newEndDate: string }) => void;
  isSubmitting: boolean;
}

export const RescheduleForm = ({ onSubmit, isSubmitting }: RescheduleFormProps) => {
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const handleSubmit = () => {
    onSubmit({ newStartDate, newEndDate });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="start-date">New Start Date</Label>
          <Input
            id="start-date"
            type="date"
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="end-date">New End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
