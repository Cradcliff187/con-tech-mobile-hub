import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Stakeholder } from '@/hooks/useStakeholders';

interface EstimateFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  stakeholderFilter: string;
  onStakeholderFilterChange: (value: string) => void;
  stakeholders: Stakeholder[];
}

export const EstimateFilters = ({
  statusFilter,
  onStatusFilterChange,
  stakeholderFilter,
  onStakeholderFilterChange,
  stakeholders
}: EstimateFiltersProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'expired', label: 'Expired' }
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
        <Select value={stakeholderFilter} onValueChange={onStakeholderFilterChange}>
          <SelectTrigger className="min-h-[44px]">
            <SelectValue placeholder="Filter by stakeholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stakeholders</SelectItem>
            {stakeholders.map((stakeholder) => (
              <SelectItem key={stakeholder.id} value={stakeholder.id}>
                {stakeholder.company_name || stakeholder.contact_person}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};