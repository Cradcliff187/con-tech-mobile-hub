import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Estimate } from '@/hooks/useEstimates';

interface BidFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  estimateFilter: string;
  onEstimateFilterChange: (value: string) => void;
  estimates: Estimate[];
}

export const BidFilters = ({
  statusFilter,
  onStatusFilterChange,
  estimateFilter,
  onEstimateFilterChange,
  estimates
}: BidFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="min-w-[160px]">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px]">
        <Select value={estimateFilter} onValueChange={onEstimateFilterChange}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="Filter by estimate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Estimates</SelectItem>
            {estimates.map((estimate) => (
              <SelectItem key={estimate.id} value={estimate.id}>
                {estimate.estimate_number} - {estimate.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};