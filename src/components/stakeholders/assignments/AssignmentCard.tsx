
import { StakeholderAssignment } from '@/hooks/useStakeholderAssignments';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/database';
import { Calendar, Clock, DollarSign, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentCardProps {
  assignment: StakeholderAssignment;
  projects: Project[];
  isUpdating: boolean;
  onStatusChange: (assignmentId: string, newStatus: string, currentStatus: string) => void;
}

export const AssignmentCard = ({ 
  assignment, 
  projects, 
  isUpdating, 
  onStatusChange 
}: AssignmentCardProps) => {
  const project = projects.find(p => p.id === assignment.project_id);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800">
                {assignment.stakeholder?.company_name || assignment.stakeholder?.contact_person}
              </h3>
              <Badge className={getStatusColor(assignment.status)}>
                {assignment.status}
              </Badge>
            </div>
            
            {project && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <MapPin size={14} />
                <span>{project.name}</span>
              </div>
            )}
            
            {assignment.role && (
              <div className="text-sm text-slate-600 mb-2">
                <strong>Role:</strong> {assignment.role}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Cost and Hours Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
              <Clock size={14} />
              <span>Total Hours</span>
            </div>
            <div className="font-semibold text-slate-800">
              {assignment.total_hours.toFixed(1)}h
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
              <DollarSign size={14} />
              <span>Total Cost</span>
            </div>
            <div className="font-semibold text-slate-800">
              {formatCurrency(assignment.total_cost)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
              <DollarSign size={14} />
              <span>Hourly Rate</span>
            </div>
            <div className="font-semibold text-slate-800">
              {assignment.hourly_rate ? formatCurrency(assignment.hourly_rate) : 'N/A'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-slate-600 mb-1">
              <Calendar size={14} />
              <span>Week Start</span>
            </div>
            <div className="font-semibold text-slate-800">
              {assignment.week_start_date 
                ? format(new Date(assignment.week_start_date), 'MMM dd')
                : 'N/A'
              }
            </div>
          </div>
        </div>

        {/* Daily Hours Summary */}
        {Object.keys(assignment.daily_hours).length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Daily Hours</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(assignment.daily_hours).map(([date, hours]) => (
                <div key={date} className="bg-slate-50 px-2 py-1 rounded text-xs">
                  <span className="text-slate-600">
                    {format(new Date(date), 'MMM dd')}:
                  </span>
                  <span className="font-medium ml-1">{hours}h</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>
              {assignment.start_date 
                ? format(new Date(assignment.start_date), 'MMM dd, yyyy')
                : 'No start date'
              }
            </span>
          </div>
          {assignment.end_date && (
            <div className="flex items-center gap-1">
              <span>to</span>
              <span>{format(new Date(assignment.end_date), 'MMM dd, yyyy')}</span>
            </div>
          )}
        </div>

        {assignment.notes && (
          <div className="text-sm text-slate-600 mb-4">
            <strong>Notes:</strong> {assignment.notes}
          </div>
        )}

        {/* Status Update Actions */}
        <div className="flex gap-2">
          {assignment.status !== 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(assignment.id, 'active', assignment.status)}
              disabled={isUpdating}
            >
              Activate
            </Button>
          )}
          {assignment.status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(assignment.id, 'completed', assignment.status)}
              disabled={isUpdating}
            >
              Complete
            </Button>
          )}
          {assignment.status !== 'on-hold' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(assignment.id, 'on-hold', assignment.status)}
              disabled={isUpdating}
            >
              Hold
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
