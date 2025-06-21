
import { useState } from 'react';
import { DataTable, type Column } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Mail, Phone, Edit, Trash2, UserPlus } from 'lucide-react';
import type { Stakeholder } from '@/types/database';

interface StakeholderListViewProps {
  stakeholders: Stakeholder[];
  loading: boolean;
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholder: Stakeholder) => void;
  onCreate: () => void;
}

export const StakeholderListView = ({
  stakeholders,
  loading,
  onEdit,
  onDelete,
  onCreate
}: StakeholderListViewProps) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'inactive': 'secondary',
      'pending': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'project_manager': 'bg-blue-100 text-blue-800',
      'site_supervisor': 'bg-green-100 text-green-800',
      'worker': 'bg-yellow-100 text-yellow-800',
      'client': 'bg-purple-100 text-purple-800',
      'stakeholder': 'bg-gray-100 text-gray-800',
      'vendor': 'bg-orange-100 text-orange-800'
    } as const;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors] || colors.stakeholder}`}>
        {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const columns: Column<Stakeholder>[] = [
    {
      key: 'contact_person',
      header: 'Name',
      accessor: (stakeholder) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
              {stakeholder.contact_person?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-slate-900">
              {stakeholder.contact_person || 'Unknown'}
            </div>
            {stakeholder.company_name && (
              <div className="text-sm text-slate-500">
                {stakeholder.company_name}
              </div>
            )}
          </div>
        </div>
      ),
      sortable: true,
      mobileLabel: 'Contact'
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (stakeholder) => getRoleBadge(stakeholder.role || 'stakeholder'),
      filterable: true,
      mobileLabel: 'Role'
    },
    {
      key: 'account_status',
      header: 'Status',
      accessor: (stakeholder) => getStatusBadge(stakeholder.account_status || 'pending'),
      filterable: true,
      mobileLabel: 'Status'
    },
    {
      key: 'email',
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

  const renderActions = (stakeholder: Stakeholder) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(stakeholder);
        }}
        className="h-8 w-8 p-0"
      >
        <Edit size={14} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(stakeholder);
        }}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );

  if (!loading && stakeholders.length === 0) {
    return (
      <EmptyState
        variant="card"
        icon={<Users size={48} className="text-slate-400" />}
        title="No Team Members Yet"
        description="Add your first team member to start collaborating on construction projects."
        actions={[
          {
            label: "Add Team Member",
            onClick: onCreate,
            icon: <UserPlus size={16} />
          }
        ]}
      />
    );
  }

  return (
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
  );
};
