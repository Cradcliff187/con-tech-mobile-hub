
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
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, CalendarDays, Wrench, User } from 'lucide-react';
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
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();
  
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [operatorAssignments, setOperatorAssignments] = useState<Record<string, string>>({});
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
    }
  }, [open]);

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

    setIsSubmitting(true);

    try {
      const updates = selectedEquipment.map(equipmentId => {
        const operatorId = operatorAssignments[equipmentId];
        return supabase
          .from('equipment')
          .update({
            project_id: project.id,
            status: 'in-use',
            assigned_operator_id: operatorId || null
          })
          .eq('id', equipmentId);
      });

      const results = await Promise.all(updates);
      
      const hasErrors = results.some(result => result.error);
      if (hasErrors) {
        throw new Error('Failed to assign some equipment');
      }

      toast({
        title: "Success",
        description: `Successfully assigned ${selectedEquipment.length} equipment item(s) to ${project.name}`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to assign equipment to project",
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
          <DialogTitle>Assign Equipment to {project.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center gap-2">
                <Calendar size={16} />
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="flex items-center gap-2">
                <CalendarDays size={16} />
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
                <p>No available equipment to assign</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableEquipment.map((eq) => (
                  <Card key={eq.id} className="p-4">
                    <CardContent className="p-0 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={selectedEquipment.includes(eq.id)}
                            onCheckedChange={(checked) => 
                              handleEquipmentToggle(eq.id, checked as boolean)
                            }
                          />
                          <div>
                            <h3 className="font-medium">{eq.name}</h3>
                            <p className="text-sm text-slate-600">{eq.type}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{eq.status}</Badge>
                      </div>

                      {selectedEquipment.includes(eq.id) && (
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
                ))}
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
              disabled={isSubmitting || selectedEquipment.length === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? 'Assigning...' : `Assign ${selectedEquipment.length} Equipment`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
