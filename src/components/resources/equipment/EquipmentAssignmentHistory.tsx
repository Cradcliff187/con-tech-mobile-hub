
import { Clock, User, MapPin, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEquipmentAssignmentHistory, EquipmentAssignmentHistory } from '@/hooks/useEquipmentAssignmentHistory';
import { format } from 'date-fns';

interface EquipmentAssignmentHistoryProps {
  equipmentId: string;
}

export const EquipmentAssignmentHistoryComponent = ({ equipmentId }: EquipmentAssignmentHistoryProps) => {
  const { history, loading } = useEquipmentAssignmentHistory(equipmentId);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock size={48} className="mx-auto mb-4 text-slate-300" />
        <p>No assignment history found for this equipment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Assignment History</h3>
      <div className="space-y-3">
        {history.map((record) => (
          <HistoryCard key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
};

const HistoryCard = ({ record }: { record: EquipmentAssignmentHistory }) => {
  const isActive = !record.end_date;
  
  return (
    <Card className={`${isActive ? 'border-orange-200 bg-orange-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {record.project?.name || 'Unassigned'}
            {isActive && <Badge className="ml-2 bg-orange-600">Active</Badge>}
          </CardTitle>
          <div className="text-xs text-slate-500">
            {format(new Date(record.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {format(new Date(record.start_date), 'MMM d, yyyy')}
                {record.end_date && (
                  <span> - {format(new Date(record.end_date), 'MMM d, yyyy')}</span>
                )}
              </span>
            </div>
            
            {record.project && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{record.project.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {(record.operator || record.assigned_operator) && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  {record.operator?.full_name || 
                   record.assigned_operator?.contact_person || 
                   'Unknown Operator'}
                </span>
              </div>
            )}

            {record.assigned_by_user && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">
                  Assigned by: {record.assigned_by_user.full_name}
                </span>
              </div>
            )}
          </div>
        </div>

        {record.notes && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
              <span className="text-sm text-slate-600">{record.notes}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
