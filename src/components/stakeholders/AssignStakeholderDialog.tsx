
import { useState } from 'react';
import { useStakeholderAssignments, Stakeholder } from '@/hooks/useStakeholders';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AssignStakeholderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stakeholder: Stakeholder | null;
}

export const AssignStakeholderDialog = ({ open, onOpenChange, stakeholder }: AssignStakeholderDialogProps) => {
  const { createAssignment } = useStakeholderAssignments();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    role: '',
    start_date: '',
    end_date: '',
    hourly_rate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stakeholder || !formData.project_id) {
      toast({
        title: "Validation Error",
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const assignmentData = {
      stakeholder_id: stakeholder.id,
      project_id: formData.project_id,
      task_id: formData.task_id || undefined,
      role: formData.role || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      notes: formData.notes || undefined,
      status: 'assigned'
    };

    const { error } = await createAssignment(assignmentData);
    
    if (!error) {
      setFormData({
        project_id: '',
        task_id: '',
        role: '',
        start_date: '',
        end_date: '',
        hourly_rate: '',
        notes: ''
      });
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Stakeholder assigned successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to assign stakeholder. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);
  const availableTasks = tasks.filter(t => t.project_id === formData.project_id);

  if (!stakeholder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign {stakeholder.company_name} to Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="project_id">Project *</Label>
            <Select 
              value={formData.project_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value, task_id: '' }))}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject && availableTasks.length > 0 && (
            <div>
              <Label htmlFor="task_id">Task (Optional)</Label>
              <Select 
                value={formData.task_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, task_id: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select a task (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="">No specific task</SelectItem>
                  {availableTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="min-h-[44px]"
              placeholder="e.g., Site Supervisor, Equipment Operator, Supplier"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="min-h-[44px]"
                min={formData.start_date}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
              className="min-h-[44px]"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="notes">Assignment Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[88px]"
              placeholder="Special instructions, requirements, or notes for this assignment..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !formData.project_id} 
              className="flex-1 min-h-[44px] bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Assigning...' : 'Assign to Project'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1 min-h-[44px]"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
