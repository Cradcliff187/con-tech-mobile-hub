import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit2, Trash2, MoreVertical, FolderPlus } from 'lucide-react';
import { GlobalStatusDropdown } from '@/components/ui/global-status-dropdown';
import type { Estimate } from '@/hooks/useEstimates';

interface EstimateListProps {
  estimates: Estimate[];
  loading?: boolean;
  onEdit: (estimate: Estimate) => void;
  onDelete: (estimate: Estimate) => void;
  onPreview: (estimate: Estimate) => void;
  onStatusChange: (estimateId: string, status: Estimate['status']) => void;
  onConvertToProject?: (estimate: Estimate) => void;
}

export const EstimateList = ({
  estimates,
  loading = false,
  onEdit,
  onDelete,
  onPreview,
  onStatusChange,
  onConvertToProject
}: EstimateListProps) => {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (estimate: Estimate) => estimate.valid_until && 
    new Date(estimate.valid_until) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const columns: Column<Estimate>[] = [
    {
      key: 'estimate_number',
      header: 'Estimate #',
      accessor: (estimate) => (
        <span className="font-mono text-sm">{estimate.estimate_number}</span>
      ),
      sortable: true,
      mobileLabel: 'Number'
    },
    {
      key: 'title',
      header: 'Title',
      accessor: (estimate) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{estimate.title}</span>
          {isExpiringSoon(estimate) && estimate.status !== 'accepted' && estimate.status !== 'declined' && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
              Expires Soon
            </Badge>
          )}
        </div>
      ),
      sortable: true,
      mobileLabel: 'Title'
    },
    {
      key: 'stakeholder',
      header: 'Client',
      accessor: (estimate) => (
        <span className="text-sm">
          {estimate.stakeholder?.company_name || estimate.stakeholder?.contact_person || 'N/A'}
        </span>
      ),
      mobileLabel: 'Client'
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (estimate) => (
        <GlobalStatusDropdown
          entityType="estimate"
          currentStatus={estimate.status}
          onStatusChange={(newStatus) => onStatusChange(estimate.id, newStatus as Estimate['status'])}
          size="sm"
          showAsDropdown={true}
        />
      ),
      filterable: true,
      mobileLabel: 'Status'
    },
    {
      key: 'amount',
      header: 'Amount',
      accessor: (estimate) => (
        <span className="font-semibold">{formatCurrency(estimate.amount)}</span>
      ),
      sortable: true,
      className: 'text-right',
      mobileLabel: 'Amount'
    },
    {
      key: 'created_at',
      header: 'Created',
      accessor: (estimate) => (
        <span className="text-sm text-slate-600">{formatDate(estimate.created_at)}</span>
      ),
      sortable: true,
      mobileLabel: 'Created'
    },
    {
      key: 'valid_until',
      header: 'Valid Until',
      accessor: (estimate) => (
        <span className={`text-sm ${isExpiringSoon(estimate) ? 'text-orange-600 font-medium' : 'text-slate-600'}`}>
          {formatDate(estimate.valid_until)}
        </span>
      ),
      mobileLabel: 'Valid Until'
    }
  ];

  const getActions = (estimate: Estimate) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onPreview(estimate)}>
          <Eye size={16} className="mr-2" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(estimate)}>
          <Edit2 size={16} className="mr-2" />
          Edit
        </DropdownMenuItem>
        {estimate.status === 'accepted' && !estimate.project_id && onConvertToProject && (
          <DropdownMenuItem onClick={() => onConvertToProject(estimate)}>
            <FolderPlus size={16} className="mr-2" />
            Convert to Project
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onDelete(estimate)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <DataTable
      data={estimates}
      columns={columns}
      loading={loading}
      searchable={true}
      filterable={true}
      sortable={true}
      actions={getActions}
      emptyMessage="No estimates found"
      mobileCardView={true}
    />
  );
};