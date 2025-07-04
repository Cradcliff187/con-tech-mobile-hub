import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRFIs } from '@/hooks/useRFIs';
import { CreateRFIDialog } from './CreateRFIDialog';
import { RFIDocuments } from './RFIDocuments';
import { FileText, Plus, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface RFIListProps {
  projectId?: string;
}

export const RFIList = ({ projectId }: RFIListProps) => {
  const { rfis, loading } = useRFIs(projectId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [expandedRFI, setExpandedRFI] = useState<string | null>(null);

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
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        <h2 className="text-2xl font-bold text-slate-800">RFIs (Requests for Information)</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create RFI
        </Button>
      </div>

      {rfis.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No RFIs yet</h3>
            <p className="text-slate-600 mb-4">Create your first Request for Information to track project questions and responses.</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First RFI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rfis.map((rfi) => (
            <Card key={rfi.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{rfi.title}</h3>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(rfi.priority)}`} title={`${rfi.priority} priority`} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{rfi.submitter?.full_name || rfi.submitter?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(rfi.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                      {rfi.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {format(new Date(rfi.due_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(rfi.status)}>
                    {rfi.status.charAt(0).toUpperCase() + rfi.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {rfi.description && (
                  <p className="text-slate-700 mb-4">{rfi.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    {rfi.project?.name && <span>Project: {rfi.project.name}</span>}
                    {rfi.assignee && <span className="ml-4">Assigned to: {rfi.assignee.full_name || rfi.assignee.email}</span>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedRFI(expandedRFI === rfi.id ? null : rfi.id)}
                  >
                    {expandedRFI === rfi.id ? 'Hide' : 'View'} Documents
                  </Button>
                </div>

                {expandedRFI === rfi.id && (
                  <div className="mt-4 pt-4 border-t">
                    <RFIDocuments rfiId={rfi.id} projectId={rfi.project_id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateRFIDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
      />
    </div>
  );
};