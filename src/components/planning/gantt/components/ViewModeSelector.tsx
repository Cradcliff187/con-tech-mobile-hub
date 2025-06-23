
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ViewModeSelectorProps {
  value: 'days' | 'weeks' | 'months';
  onChange: (mode: 'days' | 'weeks' | 'months') => void;
}

export const ViewModeSelector = ({ value, onChange }: ViewModeSelectorProps) => {
  return (
    <Tabs value={value} onValueChange={onChange} className="w-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="days" className="text-xs">Days</TabsTrigger>
        <TabsTrigger value="weeks" className="text-xs">Weeks</TabsTrigger>
        <TabsTrigger value="months" className="text-xs">Months</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
