
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PunchListFilterProps {
  punchListCategory: string;
  inspectionStatus: string;
  onPunchListCategoryChange: (value: string) => void;
  onInspectionStatusChange: (value: string) => void;
}

const PUNCH_LIST_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'paint', label: 'Paint' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'flooring', label: 'Flooring' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'other', label: 'Other' }
];

const INSPECTION_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' }
];

export const PunchListFilter = ({
  punchListCategory,
  inspectionStatus,
  onPunchListCategoryChange,
  onInspectionStatusChange
}: PunchListFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg border">
      <div className="flex-1 space-y-2">
        <Label htmlFor="category-filter">Category</Label>
        <Select value={punchListCategory} onValueChange={onPunchListCategoryChange}>
          <SelectTrigger id="category-filter" className="bg-white">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border shadow-lg">
            {PUNCH_LIST_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 space-y-2">
        <Label htmlFor="status-filter">Inspection Status</Label>
        <Select value={inspectionStatus} onValueChange={onInspectionStatusChange}>
          <SelectTrigger id="status-filter" className="bg-white">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white border shadow-lg">
            {INSPECTION_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
