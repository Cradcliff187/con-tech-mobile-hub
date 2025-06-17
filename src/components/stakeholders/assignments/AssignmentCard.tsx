
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Briefcase, DollarSign, Clock } from 'lucide-react';
import { StakeholderAssignment } from '@/hooks/useStakeholderAssignments';
import { Project } from '@/types/database';
import { validateSelectData, getSelectDisplayName } from '@/utils/selectHelpers';

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
  const validatedProjects = validateSelectData(projects);
  const project = validatedProjects.find(p => p.id === assignment.project_id);

  return (
    <Card key={assignment.id}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">
              {getSelectDisplayName(assignment.stakeholder, ['company_name'], 'Unknown Stakeholder')}
            </CardTitle>
            {project && (
              <p className="text-sm text-slate-600 mt-1">
                Project: {getSelectDisplayName(project, ['name'], 'Unnamed Project')}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge className={
              assignment.status === 'active' ? 'bg-green-100 text-green-800' :
              assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              assignment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              assignment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-800'
            }>
              {assignment.status}
            </Badge>
            <Select
              value={assignment.status}
              onValueChange={(newStatus) => onStatusChange(assignment.id, newStatus, assignment.status)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {isUpdating && (
              <div className="flex items-center text-sm text-slate-500">
                <Clock size={16} className="animate-spin mr-1" />
                Updating...
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <User size={16} className="text-slate-500" />
            <span>{assignment.stakeholder?.stakeholder_type}</span>
          </div>
          
          {assignment.role && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={16} className="text-slate-500" />
              <span>{assignment.role}</span>
            </div>
          )}
          
          {assignment.start_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-slate-500" />
              <span>
                {new Date(assignment.start_date).toLocaleDateString()}
                {assignment.end_date && ` - ${new Date(assignment.end_date).toLocaleDateString()}`}
              </span>
            </div>
          )}
          
          {assignment.hourly_rate && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-slate-500" />
              <span>${assignment.hourly_rate}/hr</span>
            </div>
          )}
        </div>
        
        {assignment.notes && (
          <div className="bg-slate-50 p-3 rounded-md">
            <p className="text-sm text-slate-600">{assignment.notes}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="min-h-[36px]">
            Edit Assignment
          </Button>
          <Button variant="outline" size="sm" className="min-h-[36px]">
            View Performance
          </Button>
          <Button variant="outline" size="sm" className="min-h-[36px]">
            Contact Stakeholder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
