
import { useState, useEffect } from 'react';
import { useStakeholderAssignments, Stakeholder } from '@/hooks/useStakeholderAssignments';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { calculateSkillMatchPercentage } from '@/utils/skill-matching';
import { getAssignmentDefaults } from '@/utils/smart-defaults';

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
    task_id: 'none',
    role: '',
    start_date: '',
    end_date: '',
    hourly_rate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const selectedProject = projects.find(p => p.id === formData.project_id);

  // Apply smart defaults when stakeholder or project changes
  useEffect(() => {
    if (stakeholder && selectedProject) {
      const defaults = getAssignmentDefaults(stakeholder, selectedProject);
      setFormData(prev => ({
        ...prev,
        hourly_rate: defaults.hourly_rate?.toString() || prev.hourly_rate,
        start_date: defaults.start_date || prev.start_date,
        end_date: defaults.end_date || prev.end_date,
        role: defaults.role || prev.role
      }));
    }
  }, [stakeholder, selectedProject]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open && stakeholder) {
      const currentDate = new Date().toISOString().split('T')[0];
      setFormData({
        project_id: '',
        task_id: 'none',
        role: '',
        start_date: currentDate,
        end_date: '',
        hourly_rate: '',
        notes: ''
      });
    }
  }, [open, stakeholder]);

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
      task_id: formData.task_id !== 'none' ? formData.task_id : undefined,
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
        task_id: 'none',
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

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId, task_id: 'none' }));
  };

  const availableTasks = tasks.filter(t => t.project_id === formData.project_id);

  // Filter and sort tasks by skill match when stakeholder has specialties
  const getFilteredAndSortedTasks = () => {
    if (!stakeholder?.specialties || stakeholder.specialties.length === 0) {
      return availableTasks;
    }

    const tasksWithSkillMatch = availableTasks.map(task => ({
      ...task,
      skillMatchPercentage: calculateSkillMatchPercentage(
        task.required_skills || [], 
        stakeholder.specialties || []
      )
    }));

    // Filter to show tasks with >0% match first, then others
    const matchingTasks = tasksWithSkillMatch.filter(task => task.skillMatchPercentage > 0);
    const nonMatchingTasks = tasksWithSkillMatch.filter(task => task.skillMatchPercentage === 0);

    // Sort matching tasks by skill match percentage (highest first)
    matchingTasks.sort((a, b) => b.skillMatchPercentage - a.skillMatchPercentage);

    // Return matching tasks first, then non-matching tasks
    return [...matchingTasks, ...nonMatchingTasks];
  };

  const filteredTasks = getFilteredAndSortedTasks();

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
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} {project.phase && (
                      <span className="text-xs text-slate-500 ml-2">({project.phase})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && stakeholder && (
              <p className="text-xs text-blue-600 mt-1">
                Smart defaults applied for {stakeholder.stakeholder_type} in {selectedProject.phase} phase
              </p>
            )}
          </div>

          {selectedProject && filteredTasks.length > 0 && (
            <div>
              <Label htmlFor="task_id">Task (Optional) - Sorted by skill compatibility</Label>
              <Select 
                value={formData.task_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, task_id: value }))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Select a task (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No specific task</SelectItem>
                  {filteredTasks.map((task) => {
                    const matchPercentage = stakeholder.specialties && stakeholder.specialties.length > 0 
                      ? calculateSkillMatchPercentage(task.required_skills || [], stakeholder.specialties || [])
                      : null;
                    
                    return (
                      <SelectItem key={task.id} value={task.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="flex-1 truncate">
                            {task.title}
                            {matchPercentage !== null && (
                              <span className="text-sm text-muted-foreground ml-1">
                                ({matchPercentage}% match)
                              </span>
                            )}
                          </span>
                          {matchPercentage !== null && (
                            <Badge 
                              variant={matchPercentage >= 80 ? "default" : matchPercentage >= 50 ? "secondary" : "outline"}
                              className="ml-2 text-xs"
                            >
                              {matchPercentage}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {stakeholder.specialties && stakeholder.specialties.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks are sorted by compatibility with stakeholder skills: {stakeholder.specialties.join(', ')}
                </p>
              )}
            </div>
          )}

          {selectedProject && filteredTasks.length === 0 && (
            <div>
              <Label>Task (Optional)</Label>
              <p className="text-sm text-muted-foreground mt-1">No tasks available for this project</p>
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
            {formData.role && (
              <p className="text-xs text-green-600 mt-1">
                Role suggested based on skills and project phase
              </p>
            )}
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
            {formData.hourly_rate && (
              <p className="text-xs text-green-600 mt-1">
                Rate suggested based on stakeholder type: {stakeholder.stakeholder_type}
              </p>
            )}
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
