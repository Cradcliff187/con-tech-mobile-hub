
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/hooks/useEquipment';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess?: () => void;
}

export const EditEquipmentDialog = ({ open, onOpenChange, equipment, onSuccess }: EditEquipmentDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('available');
  const [projectId, setProjectId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [maintenanceDue, setMaintenanceDue] = useState('');

  const { projects } = useProjects();
  const { toast } = useToast();

  const updateOperation = useAsyncOperation({
    successMessage: "Equipment updated successfully",
    errorMessage: "Failed to update equipment",
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    }
  });

  // Pre-fill form with equipment data when dialog opens
  useEffect(() => {
    if (equipment && open) {
      setName(equipment.name);
      setType(equipment.type || '');
      setStatus(equipment.status);
      setProjectId(equipment.project_id || '');
      setOperatorId(equipment.operator_id || '');
      setMaintenanceDue(equipment.maintenance_due || '');
    }
  }, [equipment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!equipment || !name.trim() || !type.trim()) {
      toast({
        title: "Validation Error",
        description: "Equipment name and type are required",
        variant: "destructive"
      });
      return;
    }

    await updateOperation.execute(async () => {
      const { error } = await supabase
        .from('equipment')
        .update({
          name: name.trim(),
          type: type.trim(),
          status,
          project_id: projectId || null,
          operator_id: operatorId || null,
          maintenance_due: maintenanceDue || null,
        })
        .eq('id', equipment.id);

      if (error) {
        throw new Error(error.message);
      }
    });
  };

  const resetForm = () => {
    setName('');
    setType('');
    setStatus('available');
    setProjectId('');
    setOperatorId('');
    setMaintenanceDue('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Equipment Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Excavator CAT 320"
              required
              disabled={updateOperation.loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-type">Type *</Label>
            <Input
              id="edit-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., Heavy Machinery"
              required
              disabled={updateOperation.loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={setStatus} disabled={updateOperation.loading}>
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
            <Label htmlFor="edit-project">Assigned Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={updateOperation.loading}>
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

          <div className="space-y-2">
            <Label htmlFor="edit-operator">Operator</Label>
            <Input
              id="edit-operator"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
              placeholder="Operator ID (optional)"
              disabled={updateOperation.loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-maintenanceDue">Maintenance Due Date</Label>
            <Input
              id="edit-maintenanceDue"
              type="date"
              value={maintenanceDue}
              onChange={(e) => setMaintenanceDue(e.target.value)}
              disabled={updateOperation.loading}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={updateOperation.loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateOperation.loading || !name.trim() || !type.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateOperation.loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
