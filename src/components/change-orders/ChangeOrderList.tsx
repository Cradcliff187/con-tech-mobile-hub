import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChangeOrders, useChangeOrderDocuments } from '@/hooks/useChangeOrders';
import { CreateChangeOrderDialog } from './CreateChangeOrderDialog';
import { ChangeOrderDocuments } from './ChangeOrderDocuments';
import { FileText, Plus, Calendar, User, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ChangeOrderListProps {
  projectId?: string;
}

export const ChangeOrderList = ({ projectId }: ChangeOrderListProps) => {
  const { changeOrders, loading } = useChangeOrders(projectId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedChangeOrder, setExpandedChangeOrder] = useState<string | null>(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-slate-200 rounded"></div>
            <div className="h-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Change Orders</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Change Order
        </Button>
      </div>

      {changeOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No change orders yet</h3>
            <p className="text-slate-600 mb-4">Create your first change order to track project modifications and approvals.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Change Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {changeOrders.map((changeOrder) => (
            <ChangeOrderCard 
              key={changeOrder.id} 
              changeOrder={changeOrder}
              expandedChangeOrder={expandedChangeOrder}
              setExpandedChangeOrder={setExpandedChangeOrder}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      <CreateChangeOrderDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};

interface ChangeOrderCardProps {
  changeOrder: any;
  expandedChangeOrder: string | null;
  setExpandedChangeOrder: (id: string | null) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  formatCurrency: (amount?: number) => string;
}

const ChangeOrderCard = ({ 
  changeOrder, 
  expandedChangeOrder, 
  setExpandedChangeOrder,
  getPriorityColor,
  getStatusColor,
  formatCurrency
}: ChangeOrderCardProps) => {
  const { documents } = useChangeOrderDocuments(changeOrder.id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{changeOrder.title}</h3>
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(changeOrder.priority)}`} title={`${changeOrder.priority} priority`} />
              {documents.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {documents.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{changeOrder.requester?.full_name || changeOrder.requester?.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(changeOrder.created_at), 'MMM dd, yyyy')}</span>
              </div>
              {changeOrder.cost_impact && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatCurrency(changeOrder.cost_impact)}</span>
                </div>
              )}
              {changeOrder.schedule_impact_days && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{changeOrder.schedule_impact_days} days</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(changeOrder.status)}>
            {changeOrder.status.replace('_', ' ').charAt(0).toUpperCase() + changeOrder.status.replace('_', ' ').slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {changeOrder.description && (
          <p className="text-slate-700 mb-4">{changeOrder.description}</p>
        )}
        
        {changeOrder.reason_for_change && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-900 mb-1">Reason for Change:</h4>
            <p className="text-sm text-slate-600">{changeOrder.reason_for_change}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {changeOrder.project?.name && <span>Project: {changeOrder.project.name}</span>}
            {changeOrder.approver && <span className="ml-4">Approved by: {changeOrder.approver.full_name || changeOrder.approver.email}</span>}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedChangeOrder(expandedChangeOrder === changeOrder.id ? null : changeOrder.id)}
          >
            {expandedChangeOrder === changeOrder.id ? 'Hide' : 'View'} Documents
          </Button>
        </div>

        {expandedChangeOrder === changeOrder.id && (
          <div className="mt-4 pt-4 border-t">
            <ChangeOrderDocuments changeOrderId={changeOrder.id} projectId={changeOrder.project_id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};