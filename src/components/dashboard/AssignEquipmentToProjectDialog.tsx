
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEquipment } from '@/hooks/useEquipment';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, CalendarDays, Wrench, User, AlertTriangle } from 'lucide-react';
import type { Project } from '@/types/database';

interface AssignEquipmentToProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AssignEquipmentToProjectDialog = ({
  project,
  open,
  onOpenChange,
  onSuccess
}: AssignEquipmentToProjectDialogProps) => {
  const { equipment, loading: equipmentLoading } = useEquipment();
  const { createAllocation, checkAvailability } = useEquipmentAllocations();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();
  
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [operatorAssignments, setOperatorAssignments] = useState<Record<string, string>>({});
  const [availabilityCheck, setAvailabilityCheck] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableEquipment = equipment.filter(eq => eq.status === 'available');
  const availableOperators = stakeholders.filter(s => 
    s.stakeholder_type === 'employee' && s.status === 'active'
  );

  useEffect(() => {
    if (!open) {
      setSelectedEquipment([]);
      setStartDate('');
      setEndDate('');
      setOperatorAssignments({});
      setAvailabilityCheck({});
    }
  }, [open]);

  useEffect(() => {
    const checkEquipmentAvailability = async () => {
      if (!startDate || !endDate || selectedEquipment.length === 0) {
        setAvailabilityCheck({});
        return;
      }

      const checks: Record<string, boolean> = {};
      
      for (const equipmentId of selectedEquipment) {
        const { isAvailable } = await checkAvailability(equipmentId, startDate, endDate);
        checks[equipmentId] = isAvailable || false;
      }
      
      setAvailabilityCheck(checks);
    };

    checkEquipmentAvailability();
  }, [selectedEquipment, startDate, endDate, checkAvailability]);

  const handleEquipmentToggle = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment(prev => [...prev, equipmentId]);
    } else {
      setSelectedEquipment(prev => prev.filter(id => id !== equipmentId));
      setOperatorAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[equipmentId];
        return newAssignments;
      });
    }
  };

  const handleOperatorAssignment = (equipmentId: string, operatorId: string) => {
    setOperatorAssignments(prev => ({
      ...prev,
      [equipmentId]: operatorId
    }));
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one equipment item",
        variant: "destructive"
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive"
      });
      return;
    }

    const hasUnavailableEquipment = selectedEquipment.some(id => availabilityCheck[id] === false);
    if (hasUnavailableEquipment) {
      toast({
        title: "Error",
        description: "Some selected equipment is not available for the selected dates",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const allocationPromises = selectedEquipment.map(async (equipmentId) => {
        const allocationResult = await createAllocation({
          equipment_id: equipmentId,
          project_id: project.id,
          start_date: startDate,
          end_date: endDate
        });

        if (allocationResult.error) {
          const errorMessage = typeof allocationResult.error === 'string' 
            ? allocationResult.error 
            : allocationResult.error.message || 'Failed to allocate equipment';
          throw new Error(errorMessage);
        }

        const operatorId = operatorAssignments[equipmentId];
        const { error: equipmentError } = await supabase
          .from('equipment')
          .update({
            status: 'in-use',
            assigned_operator_id: operatorId || null
          })
          .eq('id', equipmentId);

        if (equipmentError) {
          throw new Error(equipmentError.message || 'Failed to update equipment');
        }

        return allocationResult;
      });

      await Promise.all(allocationPromises);

      toast({
        title: "Success",
        description: `Successfully allocated ${selectedEquipment.length} equipment item(s) to ${project.name}`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error allocating equipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to allocate equipment to project",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Equipment to {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar size={16} />
                Allocation Start Date *
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <CalendarDays size={16} />
                Allocation End Date *
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Available Equipment</Label>
            {equipmentLoading ? (
              <div className="text-center py-8">Loading equipment...</div>
            ) : availableEquipment.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Wrench size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No available equipment to allocate</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableEquipment.map((eq) => {
                  const isSelected = selectedEquipment.includes(eq.id);
                  const isAvailable = availabilityCheck[eq.id];
                  const showAvailabilityCheck = isSelected && startDate && endDate;

                  return (
                    <Card key={eq.id} className="p-4">
                      <CardContent className="p-0 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => 
                                handleEquipmentToggle(eq.id, checked as boolean)
                              }
                            />
                            <div>
                              <h3 className="font-medium">{eq.name}</h3>
                              <p className="text-sm text-slate-600">{eq.type}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary">{eq.status}</Badge>
                            {showAvailabilityCheck && (
                              <div className="flex items-center gap-1">
                                {isAvailable === false ? (
                                  <>
                                    <AlertTriangle size={14} className="text-red-500" />
                                    <span className="text-xs text-red-600">Not Available</span>
                                  </>
                                ) : isAvailable === true ? (
                                  <span className="text-xs text-green-600">Available</span>
                                ) : (
                                  <span className="text-xs text-slate-500">Checking...</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="space-y-2 pl-6">
                            <Label className="text-sm flex items-center gap-2">
                              <User size={14} />
                              Assign Operator (Optional)
                            </Label>
                            <Select
                              value={operatorAssignments[eq.id] || ''}
                              onValueChange={(value) => handleOperatorAssignment(eq.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select operator..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableOperators.map((operator) => (
                                  <SelectItem key={operator.id} value={operator.id}>
                                    {operator.contact_person || operator.company_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                selectedEquipment.length === 0 || 
                !startDate || 
                !endDate ||
                selectedEquipment.some(id => availabilityCheck[id] === false)
              }
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Allocating...' : `Allocate ${selectedEquipment.length} Equipment`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
