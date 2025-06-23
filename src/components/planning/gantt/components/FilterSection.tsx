
import { Checkbox } from '@/components/ui/checkbox';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onFilterChange: (value: string, checked: boolean) => void;
}

export const FilterSection = ({ 
  title, 
  options, 
  selectedValues, 
  onFilterChange 
}: FilterSectionProps) => {
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm text-slate-700">{title}</h4>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${title.toLowerCase()}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                onFilterChange(option.value, checked as boolean)
              }
            />
            <label
              htmlFor={`${title.toLowerCase()}-${option.value}`}
              className="text-sm font-normal text-slate-600 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
