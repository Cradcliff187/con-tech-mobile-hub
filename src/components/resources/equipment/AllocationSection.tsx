
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { User, Briefcase } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useTasks } from '@/hooks/useTasks';
import { useUsers } from '@/hooks/useUsers';
import { normalizeSelectValue } from '@/utils/selectHelpers';
import { CalendarDateSelector } from './CalendarDateSelector';
import { RealTimeConflictChecker } from './RealTimeConflictChecker';
import { AllocationProgressSteps } from './AllocationProgressSteps';

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
  errors?: Record<string, string>;
  equipmentId?: string;
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
  showConflicts = false,
  errors = {},
  equipmentId
}: AllocationSectionProps) => {
  const [currentStep, setCurrentStep] = useState('dates');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [realTimeConflicts, setRealTimeConflicts] = useState<any[]>([]);

  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { users } = useUsers();
  const { tasks } = useTasks();

  const availableOperators = operatorType === 'employee' 
    ? stakeholders.filter(s => s.stakeholder_type === 'employee' && s.status === 'active')
    : users.filter(u => u.account_status === 'approved');

  const availableTasks = tasks.filter(t => t.project_id === projectId);

  // Update step completion based on form state
  useEffect(() => {
    const completed: string[] = [];
    
    if (startDate && endDate) {
      completed.push('dates');
      if (operatorId && operatorId !== 'none') {
        completed.push('operator');
        if (projectId && projectId !== 'none') {
          completed.push('details');
        }
      }
    }
    
    setCompletedSteps(completed);
    
    // Determine current step
    if (!startDate || !endDate) {
      setCurrentStep('dates');
    } else if (!operatorId || operatorId === 'none') {
      setCurrentStep('operator');
    } else {
      setCurrentStep('details');
    }
  }, [startDate, endDate, operatorId, projectId]);

  const handleOperatorTypeChange = (checked: boolean) => {
    const newType = checked ? 'user' : 'employee';
    onOperatorTypeChange(newType);
    // Reset operator selection when type changes
    onOperatorChange('none');
  };

  const handleConflictsChange = (conflicts: any[], hasConflicts: boolean) => {
    setRealTimeConflicts(conflicts);
  };

  const getFieldErrorClass = (fieldName: string) => {
    return errors[fieldName] ? 'border-red-500 focus:border-red-500' : '';
  };

  // Get conflict dates for calendar highlighting
  const conflictDates = realTimeConflicts.map(conflict => {
    const dates: string[] = [];
    const start = new Date(conflict.start_date);
    const end = new Date(conflict.end_date);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  }).flat();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase size={18} />
          Equipment Allocation
        </CardTitle>
        <AllocationProgressSteps 
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step 1: Date Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
            Select Allocation Period
          </div>
          
          <CalendarDateSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
            conflictDates={conflictDates}
            errors={errors}
          />

          <RealTimeConflictChecker
            equipmentId={equipmentId}
            startDate={startDate}
            endDate={endDate}
            onConflictsChange={handleConflictsChange}
          />
        </div>

        {/* Step 2: Operator Assignment */}
        {startDate && endDate && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-medium">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
              Assign Operator
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
                  onCheckedChange={handleOperatorTypeChange}
                />
                <Label htmlFor="operator-type">Internal User</Label>
              </div>
            </div>

            {/* Operator Selection */}
            <div className="space-y-2">
              <Label htmlFor="operator">
                {operatorType === 'employee' ? 'Employee' : 'Internal User'} *
              </Label>
              <Select value={normalizeSelectValue(operatorId)} onValueChange={onOperatorChange}>
                <SelectTrigger className={getFieldErrorClass('operator')}>
                  <SelectValue placeholder={`Select ${operatorType}...`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No {operatorType === 'employee' ? 'Employee' : 'User'}</SelectItem>
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
              {errors.operator && (
                <p className="text-sm text-red-600">{errors.operator}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Project and Details */}
        {operatorId && operatorId !== 'none' && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-lg font-medium">
              <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
              Project Assignment & Details
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project" className="flex items-center gap-2">
                <Briefcase size={14} />
                Project *
              </Label>
              <Select value={normalizeSelectValue(projectId)} onValueChange={onProjectChange}>
                <SelectTrigger className={getFieldErrorClass('project')}>
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.project && (
                <p className="text-sm text-red-600">{errors.project}</p>
              )}
            </div>

            {/* Task Assignment (Optional) */}
            {projectId && projectId !== 'none' && (
              <div className="space-y-2">
                <Label htmlFor="task">Task Assignment (Optional)</Label>
                <Select value={normalizeSelectValue(taskId)} onValueChange={(value) => onTaskChange(value === 'none' ? undefined : value)}>
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
          </div>
        )}

        {/* Display conflicts error */}
        {errors.conflicts && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.conflicts}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
