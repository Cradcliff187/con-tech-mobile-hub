
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewModeSelectorProps {
  value: 'days' | 'weeks' | 'months';
  onChange: (mode: 'days' | 'weeks' | 'months') => void;
  disabled?: boolean;
}

export const ViewModeSelector = ({ value, onChange, disabled = false }: ViewModeSelectorProps) => {
  const handleValueChange = (newValue: string) => {
    if (newValue === 'days' || newValue === 'weeks' || newValue === 'months') {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">View:</span>
      <Tabs value={value} onValueChange={handleValueChange} className="w-auto">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger 
            value="days" 
            className="text-xs px-3 py-1"
            disabled={disabled}
          >
            Days
          </TabsTrigger>
          <TabsTrigger 
            value="weeks" 
            className="text-xs px-3 py-1"
            disabled={disabled}
          >
            Weeks
          </TabsTrigger>
          <TabsTrigger 
            value="months" 
            className="text-xs px-3 py-1"
            disabled={disabled}
          >
            Months
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
