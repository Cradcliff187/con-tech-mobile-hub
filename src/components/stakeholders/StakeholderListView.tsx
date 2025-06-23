
import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Users, Mail, Phone, Edit, Trash2, UserPlus, Eye, MoreHorizontal, UserCheck } from 'lucide-react';
import { StakeholderDetail } from './StakeholderDetail';
import type { Stakeholder } from '@/types/database';

interface StakeholderListViewProps {
  stakeholders: Stakeholder[];
  loading: boolean;
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholder: Stakeholder) => void;
  onCreate?: () => void; // Made optional since creation is now handled by parent
  onAssign?: (stakeholder: Stakeholder) => void;
}

export const StakeholderListView = ({
  stakeholders,
  loading,
  onEdit,
  onDelete,
  onCreate,
  onAssign
}: StakeholderListViewProps) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [viewDetailsStakeholder, setViewDetailsStakeholder] = useState<Stakeholder | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'inactive': 'secondary',
      'pending': 'outline',
      'suspended': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStakeholderTypeBadge = (type: string) => {
    const colors = {
      'client': 'bg-purple-100 text-purple-800',
      'vendor': 'bg-orange-100 text-orange-800',
      'subcontractor': 'bg-blue-100 text-blue-800',
      'employee': 'bg-green-100 text-green-800'
    } as const;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getDisplayName = (stakeholder: Stakeholder) => {
    // Company name as primary, contact person as secondary
    const primaryName = stakeholder.company_name || 'Individual';
    const secondaryName = stakeholder.contact_person;
    
    return { primaryName, secondaryName };
  };

  const getAvatarFallback = (stakeholder: Stakeholder) => {
    // Use company name first, then contact person for avatar
    const name = stakeholder.company_name || stakeholder.contact_person || '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const columns: Column<Stakeholder>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (stakeholder) => {
        const { primaryName, secondaryName } = getDisplayName(stakeholder);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                {getAvatarFallback(stakeholder)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-900">
                {primaryName}
              </div>
              {secondaryName && (
                <div className="text-sm text-slate-500">
                  {secondaryName}
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
      mobileLabel: 'Name'
    },
    {
      key: 'stakeholder_type',
      header: 'Type',
      accessor: (stakeholder) => getStakeholderTypeBadge(stakeholder.stakeholder_type),
      filterable: true,
      mobileLabel: 'Type'
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (stakeholder) => getStatusBadge(stakeholder.status),
      filterable: true,
      mobileLabel: 'Status'
    },
    {
      key: 'contact',
      header: 'Contact',
      accessor: (stakeholder) => (
        <div className="space-y-1">
          {stakeholder.email && (
            <div className="flex items-center gap-1 text-sm">
              <Mail size={12} className="text-slate-400" />
              <span className="text-slate-600">{stakeholder.email}</span>
            </div>
          )}
          {stakeholder.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone size={12} className="text-slate-400" />
              <span className="text-slate-600">{stakeholder.phone}</span>
            </div>
          )}
        </div>
      ),
      mobileLabel: 'Contact Info'
    }
  ];

  const handleRowClick = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
  };

  const handleViewDetails = (stakeholder: Stakeholder) => {
    setViewDetailsStakeholder(stakeholder);
  };

  const renderActions = (stakeholder: Stakeholder) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleViewDetails(stakeholder);
        }}>
          <Eye size={14} className="mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEdit(stakeholder);
        }}>
          <Edit size={14} className="mr-2" />
          Edit
        </DropdownMenuItem>
        {onAssign && (
          <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onAssign(stakeholder);
          }}>
            <UserCheck size={14} className="mr-2" />
            Assign to Project
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(stakeholder);
          }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!loading && stakeholders.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={<Users size={48} className="text-slate-400" />}
        title="No Stakeholders Yet"
        description="Add your first stakeholder to start managing your project collaborators."
        actions={onCreate ? [
          {
            label: "Add Stakeholder",
            onClick: onCreate,
            icon: <UserPlus size={16} />
          }
        ] : []}
      />
    );
  }

  return (
    <>
      <DataTable
        data={stakeholders}
        columns={columns}
        loading={loading}
        searchable
        filterable
        pagination
        pageSize={10}
        actions={renderActions}
        onRowClick={handleRowClick}
        emptyMessage="No stakeholders found"
        emptyIcon={<Users size={32} className="text-slate-400" />}
        className="bg-white rounded-lg border border-slate-200"
      />

      {/* View Details Dialog */}
      <StakeholderDetail
        stakeholderId={viewDetailsStakeholder?.id || ''}
        open={!!viewDetailsStakeholder}
        onOpenChange={(open) => !open && setViewDetailsStakeholder(null)}
      />
    </>
  );
};
