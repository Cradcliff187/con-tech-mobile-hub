
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskDateFieldsProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  disabled?: boolean;
  getFieldError?: (fieldName: string) => string | undefined;
}

export const TaskDateFields: React.FC<TaskDateFieldsProps> = ({
  startDate,
  setStartDate,
  disabled = false,
  getFieldError
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Start Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal focus:ring-2 focus:ring-orange-300",
                !startDate && "text-muted-foreground",
                getFieldError?.('start_date') && "border-red-500"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {getFieldError?.('start_date') && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {getFieldError('start_date')}
          </p>
        )}
      </div>
    </div>
  );
};
