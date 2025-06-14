
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StakeholderFiltersProps {
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const StakeholderFilters = ({
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange
}: StakeholderFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="subcontractor">Subcontractors</SelectItem>
          <SelectItem value="employee">Employees</SelectItem>
          <SelectItem value="vendor">Vendors</SelectItem>
        </SelectContent>
      </Select>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-40 min-h-[44px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
