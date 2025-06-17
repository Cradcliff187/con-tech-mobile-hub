
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Wrench, ArrowRight } from 'lucide-react';

interface ResolutionOptionsSelectorProps {
  selectedOption: string;
  onSelectionChange: (value: string) => void;
}

export const ResolutionOptionsSelector = ({
  selectedOption,
  onSelectionChange
}: ResolutionOptionsSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Resolution Options</Label>
      <RadioGroup value={selectedOption} onValueChange={onSelectionChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="reschedule" id="reschedule" />
          <Label htmlFor="reschedule" className="flex items-center gap-2">
            <Calendar size={16} />
            Move equipment to different dates
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="alternative" id="alternative" />
          <Label htmlFor="alternative" className="flex items-center gap-2">
            <Wrench size={16} />
            Find alternative equipment
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="reassign" id="reassign" />
          <Label htmlFor="reassign" className="flex items-center gap-2">
            <ArrowRight size={16} />
            Reassign to different project
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
