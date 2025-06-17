
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarDateSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  conflictDates?: string[];
  unavailableDates?: string[];
  errors?: Record<string, string>;
}

export const CalendarDateSelector = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  conflictDates = [],
  unavailableDates = [],
  errors = {}
}: CalendarDateSelectorProps) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  const isDateConflicted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return conflictDates.includes(dateStr);
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return unavailableDates.includes(dateStr) || date < new Date();
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      onStartDateChange(dateStr);
      setStartOpen(false);
      
      // Auto-adjust end date if it's before start date
      if (endDate && date > new Date(endDate)) {
        onEndDateChange(dateStr);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      onEndDateChange(dateStr);
      setEndOpen(false);
    }
  };

  const getFieldErrorClass = (fieldName: string) => {
    return errors[fieldName] ? 'border-red-500' : '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Start Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon size={14} />
            Start Date *
          </Label>
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground",
                  getFieldErrorClass('dates')
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(new Date(startDate), 'PPP') : 'Pick start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDateObj}
                onSelect={handleStartDateSelect}
                disabled={isDateUnavailable}
                modifiers={{
                  conflicted: isDateConflicted
                }}
                modifiersStyles={{
                  conflicted: {
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 'bold'
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
              <div className="p-3 border-t bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span>Conflicted</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon size={14} />
            End Date *
          </Label>
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground",
                  getFieldErrorClass('dates')
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(new Date(endDate), 'PPP') : 'Pick end date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDateObj}
                onSelect={handleEndDateSelect}
                disabled={(date) => 
                  isDateUnavailable(date) || 
                  (startDateObj && date < startDateObj)
                }
                modifiers={{
                  conflicted: isDateConflicted
                }}
                modifiersStyles={{
                  conflicted: {
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontWeight: 'bold'
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
              <div className="p-3 border-t bg-muted/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                    <span>Conflicted</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {errors.dates && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertTriangle size={14} />
          {errors.dates}
        </div>
      )}

      {/* Date Range Info */}
      {startDate && endDate && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 text-sm">
            <Info size={14} />
            <span>
              Duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
            </span>
          </div>
        </div>
      )}

      {/* Conflicts Warning */}
      {conflictDates.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-1">
            <AlertTriangle size={14} />
            Conflicted Dates Detected
          </div>
          <p className="text-red-700 text-xs">
            Red highlighted dates have existing allocations. Please choose different dates or resolve conflicts.
          </p>
        </div>
      )}
    </div>
  );
};
