
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Briefcase, MapPin, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AllocationSummaryProps {
  equipmentName?: string;
  projectName?: string;
  operatorName?: string;
  operatorType?: 'employee' | 'user';
  startDate: string;
  endDate: string;
  taskTitle?: string;
  notes?: string;
}

export const AllocationSummary = ({
  equipmentName,
  projectName,
  operatorName,
  operatorType,
  startDate,
  endDate,
  taskTitle,
  notes
}: AllocationSummaryProps) => {
  const duration = startDate && endDate 
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Allocation Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Equipment */}
        {equipmentName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin size={16} className="text-orange-600" />
            </div>
            <div>
              <p className="font-medium">Equipment</p>
              <p className="text-sm text-gray-600">{equipmentName}</p>
            </div>
          </div>
        )}

        {/* Project */}
        {projectName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Briefcase size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Project</p>
              <p className="text-sm text-gray-600">{projectName}</p>
            </div>
          </div>
        )}

        {/* Operator */}
        {operatorName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium">Operator</p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">{operatorName}</p>
                <Badge variant="outline" className="text-xs">
                  {operatorType === 'employee' ? 'Employee' : 'Internal User'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Task */}
        {taskTitle && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Task Assignment</p>
              <p className="text-sm text-gray-600">{taskTitle}</p>
            </div>
          </div>
        )}

        {/* Duration */}
        {startDate && endDate && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-sm text-gray-600">
                {format(new Date(startDate), 'MMM dd, yyyy')} - {format(new Date(endDate), 'MMM dd, yyyy')}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{duration} days</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-sm mb-1">Notes</p>
            <p className="text-sm text-gray-600">{notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
