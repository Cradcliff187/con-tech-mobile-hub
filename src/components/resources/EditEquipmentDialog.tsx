import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjects } from '@/hooks/useProjects';
import { useStakeholders } from '@/hooks/useStakeholders';
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

interface User {
  id: string;
  full_name?: string;
  email: string;
}

export const EditEquipmentDialog = ({ open, onOpenChange, equipment, onSuccess }: EditEquipmentDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('available');
  const [projectId, setProjectId] = useState('');
  const [operatorType, setOperatorType] = useState<'employee' | 'user'>('employee');
  const [assignedOperatorId, setAssignedOperatorId] = useState('');
  const [operatorId, setOperatorId] = useState('');
  const [maintenanceDue, setMaintenanceDue] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const updateOperation = useAsyncOperation({
    successMessage: "Equipment updated successfully",
    errorMessage: "Failed to update equipment",
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    }
  });

  // Fetch company users
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('is_company_user', true)
        .eq('account_status', 'approved');

      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data || []);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Pre-fill form with equipment data when dialog opens
  useEffect(() => {
    if (equipment && open) {
      setName(equipment.name);
      setType(equipment.type || '');
      setStatus(equipment.status);
      setProjectId(equipment.project_id || '');
      setAssignedOperatorId(equipment.assigned_operator_id || '');
      setOperatorId(equipment.operator_id || '');
      setMaintenanceDue(equipment.maintenance_due || '');
      
      // Set operator type based on which field has a value
      if (equipment.assigned_operator_id) {
        setOperatorType('employee');
      } else if (equipment.operator_id) {
        setOperatorType('user');
      } else {
        setOperatorType('employee');
      }
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
      const updateData = {
        name: name.trim(),
        type: type.trim(),
        status,
        project_id: projectId || null,
        maintenance_due: maintenanceDue || null,
        assigned_operator_id: operatorType === 'employee' ? (assignedOperatorId || null) : null,
        operator_id: operatorType === 'user' ? (operatorId || null) : null,
      };

      const { error } = await supabase
        .from('equipment')
        .update(updateData)
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
    setOperatorType('employee');
    setAssignedOperatorId('');
    setOperatorId('');
    setMaintenanceDue('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !updateOperation.loading) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const employeeStakeholders = stakeholders.filter(s => s.stakeholder_type === 'employee');

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
            <Label>Operator Assignment</Label>
            <Tabs value={operatorType} onValueChange={(value) => setOperatorType(value as 'employee' | 'user')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="employee" disabled={updateOperation.loading}>Employee</TabsTrigger>
                <TabsTrigger value="user" disabled={updateOperation.loading}>Internal User</TabsTrigger>
              </TabsList>
              
              <TabsContent value="employee" className="space-y-2">
                <Select value={assignedOperatorId} onValueChange={setAssignedOperatorId} disabled={updateOperation.loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Employee</SelectItem>
                    {employeeStakeholders.map((stakeholder) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.contact_person || stakeholder.company_name || 'Unknown Employee'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
              
              <TabsContent value="user" className="space-y-2">
                <Select value={operatorId} onValueChange={setOperatorId} disabled={updateOperation.loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an internal user (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No User</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>
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
