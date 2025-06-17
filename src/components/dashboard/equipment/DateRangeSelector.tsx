
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, CalendarDays } from 'lucide-react';

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}: DateRangeSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-date" className="flex items-center gap-2">
          <Calendar size={16} />
          Allocation Start Date *
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date" className="flex items-center gap-2">
          <CalendarDays size={16} />
          Allocation End Date *
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          min={startDate || new Date().toISOString().split('T')[0]}
          required
        />
      </div>
    </div>
  );
};
