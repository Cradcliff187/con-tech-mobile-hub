
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, User, Briefcase } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useUsers } from '@/hooks/useUsers';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import type { Equipment } from '@/hooks/useEquipment';

interface QuickAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess: () => void;
}

export const QuickAllocationDialog = ({
  open,
  onOpenChange,
  equipment,
  onSuccess
}: QuickAllocationDialogProps) => {
  const [projectId, setProjectId] = useState('');
  const [operatorType, setOperatorType] = useState<'employee' | 'user'>('employee');
  const [operatorId, setOperatorId] = useState('');
  const [duration, setDuration] = useState('1'); // days
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { users } = useUsers();
  const { createAllocation } = useEquipmentAllocations();
  const { toast } = useToast();

  const availableOperators = operatorType === 'employee' 
    ? stakeholders.filter(s => s.stakeholder_type === 'employee' && s.status === 'active')
    : users.filter(u => u.account_status === 'approved');

  const handleSubmit = async () => {
    if (!equipment || !projectId || !operatorId) {
      toast({
        title: "Missing Information",
        description: "Please select a project and operator",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = addDays(new Date(), parseInt(duration)).toISOString().split('T')[0];

      const result = await createAllocation({
        equipment_id: equipment.id,
        project_id: projectId,
        operator_type: operatorType,
        operator_id: operatorId,
        start_date: startDate,
        end_date: endDate,
        notes: `Quick allocation for ${duration} day(s)`
      });

      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : result.error.message);
      }

      toast({
        title: "Equipment Allocated",
        description: `${equipment.name} has been allocated successfully`
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setProjectId('');
      setOperatorId('');
      setDuration('1');
    } catch (error) {
      console.error('Error in quick allocation:', error);
      toast({
        title: "Allocation Failed",
        description: error instanceof Error ? error.message : "Failed to allocate equipment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!equipment) return null;

  const startDate = new Date();
  const endDate = addDays(startDate, parseInt(duration));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={18} />
            Quick Allocation - {equipment.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Duration */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon size={14} />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Day</SelectItem>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">1 Week</SelectItem>
                <SelectItem value="14">2 Weeks</SelectItem>
                <SelectItem value="30">1 Month</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
            </p>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase size={14} />
              Project *
            </Label>
            <Select value={projectId} onValueChange={setProjectId}>
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

          {/* Operator Type */}
          <div className="space-y-2">
            <Label>Operator Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={operatorType === 'employee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperatorType('employee');
                  setOperatorId('');
                }}
                className="flex-1"
              >
                Employee
              </Button>
              <Button
                type="button"
                variant={operatorType === 'user' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setOperatorType('user');
                  setOperatorId('');
                }}
                className="flex-1"
              >
                Internal User
              </Button>
            </div>
          </div>

          {/* Operator */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User size={14} />
              {operatorType === 'employee' ? 'Employee' : 'Internal User'} *
            </Label>
            <Select value={operatorId} onValueChange={setOperatorId}>
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
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !projectId || !operatorId}
            className="flex-1 bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Allocating...' : 'Allocate Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
