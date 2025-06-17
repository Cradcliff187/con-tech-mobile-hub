
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Calendar, User, Briefcase } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';

interface AllocationSectionProps {
  projectId: string;
  operatorType: 'employee' | 'user';
  operatorId: string;
  taskId?: string;
  startDate: string;
  endDate: string;
  notes?: string;
  onProjectChange: (projectId: string) => void;
  onOperatorTypeChange: (type: 'employee' | 'user') => void;
  onOperatorChange: (operatorId: string) => void;
  onTaskChange: (taskId?: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onNotesChange: (notes: string) => void;
  conflicts?: any[];
  showConflicts?: boolean;
}

export const AllocationSection = ({
  projectId,
  operatorType,
  operatorId,
  taskId,
  startDate,
  endDate,
  notes,
  onProjectChange,
  onOperatorTypeChange,
  onOperatorChange,
  onTaskChange,
  onStartDateChange,
  onEndDateChange,
  onNotesChange,
  conflicts = [],
  showConflicts = false
}: AllocationSectionProps) => {
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { users } = useUsers();
  const { tasks } = useTasks();

  const availableOperators = operatorType === 'employee' 
    ? stakeholders.filter(s => s.stakeholder_type === 'employee' && s.status === 'active')
    : users.filter(u => u.account_status === 'approved');

  const availableTasks = tasks.filter(t => t.project_id === projectId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase size={18} />
          Equipment Allocation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label htmlFor="project" className="flex items-center gap-2">
            <Briefcase size={14} />
            Project *
          </Label>
          <Select value={projectId} onValueChange={onProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Operator Type Toggle */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User size={14} />
            Operator Type *
          </Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="operator-type">Employee</Label>
            <Switch
              id="operator-type"
              checked={operatorType === 'user'}
              onCheckedChange={(checked) => {
                onOperatorTypeChange(checked ? 'user' : 'employee');
                onOperatorChange(''); // Reset operator selection
              }}
            />
            <Label htmlFor="operator-type">Internal User</Label>
          </div>
        </div>

        {/* Operator Selection */}
        <div className="space-y-2">
          <Label htmlFor="operator">
            {operatorType === 'employee' ? 'Employee' : 'Internal User'} *
          </Label>
          <Select value={operatorId} onValueChange={onOperatorChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${operatorType}...`} />
            </SelectTrigger>
            <SelectContent>
              {availableOperators.map((operator) => (
                <SelectItem key={operator.id} value={operator.id}>
                  {operatorType === 'employee' 
                    ? (operator as any).contact_person || (operator as any).company_name
                    : (operator as any).full_name || (operator as any).email
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar size={14} />
              Start Date *
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="flex items-center gap-2">
              <Calendar size={14} />
              End Date *
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Task Assignment (Optional) */}
        {projectId && (
          <div className="space-y-2">
            <Label htmlFor="task">Task Assignment (Optional)</Label>
            <Select value={taskId || 'none'} onValueChange={(value) => onTaskChange(value === 'none' ? undefined : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select task..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific task</SelectItem>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Allocation Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional details about this allocation..."
            value={notes || ''}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </div>

        {/* Conflicts Warning */}
        {showConflicts && conflicts.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertTriangle size={16} />
              Allocation Conflicts Detected
            </div>
            <div className="space-y-1 text-sm text-red-700">
              {conflicts.map((conflict, index) => (
                <div key={index}>
                  • Allocated to {conflict.project?.name} from {conflict.start_date} to {conflict.end_date}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
