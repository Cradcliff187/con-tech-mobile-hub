
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Clock, Users } from 'lucide-react';

interface PersonnelResolutionOptionsProps {
  selectedOption: string;
  onOptionChange: (option: string) => void;
}

export const PersonnelResolutionOptions = ({ 
  selectedOption, 
  onOptionChange 
}: PersonnelResolutionOptionsProps) => (
  <div className="space-y-3">
    <Label className="text-sm font-medium">Resolution Options</Label>
    <RadioGroup value={selectedOption} onValueChange={onOptionChange}>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="reassign" id="reassign" />
        <Label htmlFor="reassign" className="flex items-center gap-2">
          <Users size={16} />
          Reassign tasks to other team members
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="extend" id="extend" />
        <Label htmlFor="extend" className="flex items-center gap-2">
          <Calendar size={16} />
          Extend project timeline
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="reduce" id="reduce" />
        <Label htmlFor="reduce" className="flex items-center gap-2">
          <Clock size={16} />
          Reduce allocated hours
        </Label>
      </div>
    </RadioGroup>
  </div>
);
