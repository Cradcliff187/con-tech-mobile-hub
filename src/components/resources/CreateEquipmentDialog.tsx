
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { useEquipmentAllocations } from '@/hooks/useEquipmentAllocations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from 'lucide-react';

interface CreateEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateEquipmentDialog = ({ open, onOpenChange, onSuccess }: CreateEquipmentDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('available');
  const [projectId, setProjectId] = useState('');
  const [maintenanceDue, setMaintenanceDue] = useState('');
  const [allocationStartDate, setAllocationStartDate] = useState('');
  const [allocationEndDate, setAllocationEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const { projects } = useProjects();
  const { createAllocation } = useEquipmentAllocations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate allocation dates if project is assigned
    if (projectId && status === 'in-use') {
      if (!allocationStartDate || !allocationEndDate) {
        toast({
          title: "Validation Error",
          description: "Please specify allocation dates when assigning to a project",
          variant: "destructive"
        });
        return;
      }

      if (new Date(allocationEndDate) <= new Date(allocationStartDate)) {
        toast({
          title: "Validation Error",
          description: "End date must be after start date",
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      // Create equipment first
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .insert({
          name,
          type,
          status,
          project_id: projectId || null,
          maintenance_due: maintenanceDue || null,
          utilization_rate: 0
        })
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Create allocation if equipment is assigned to project
      if (projectId && allocationStartDate && allocationEndDate) {
        const { error: allocationError } = await createAllocation({
          equipment_id: equipmentData.id,
          project_id: projectId,
          start_date: allocationStartDate,
          end_date: allocationEndDate
        });

        if (allocationError) {
          // Clean up equipment if allocation fails
          await supabase.from('equipment').delete().eq('id', equipmentData.id);
          throw allocationError;
        }
      }

      toast({
        title: "Success",
        description: "Equipment created successfully"
      });

      // Reset form
      setName('');
      setType('');
      setStatus('available');
      setProjectId('');
      setMaintenanceDue('');
      setAllocationStartDate('');
      setAllocationEndDate('');
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating equipment",
        description: error.message || "Failed to create equipment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Equipment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Equipment Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Excavator CAT 320"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Heavy Machinery"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Assigned Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Allocation Dates - shown when project is selected and status is in-use */}
          {projectId && status === 'in-use' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                <Calendar size={14} />
                Allocation Period
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="allocationStartDate" className="text-sm">Start Date *</Label>
                  <Input
                    id="allocationStartDate"
                    type="date"
                    value={allocationStartDate}
                    onChange={(e) => setAllocationStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allocationEndDate" className="text-sm">End Date *</Label>
                  <Input
                    id="allocationEndDate"
                    type="date"
                    value={allocationEndDate}
                    onChange={(e) => setAllocationEndDate(e.target.value)}
                    min={allocationStartDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="maintenanceDue">Maintenance Due Date</Label>
            <Input
              id="maintenanceDue"
              type="date"
              value={maintenanceDue}
              onChange={(e) => setMaintenanceDue(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
