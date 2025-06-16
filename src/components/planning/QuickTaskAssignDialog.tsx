import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import { TeamMember } from '@/types/database';
import { X, User } from 'lucide-react';
import { getTeamMemberDefaults, getDefaultRequiredSkills, getDefaultPriority } from '@/utils/smart-defaults';

interface QuickTaskAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  preSelectedMember?: TeamMember;
}

export const QuickTaskAssignDialog = ({ 
  open, 
  onOpenChange, 
  projectId, 
  preSelectedMember 
}: QuickTaskAssignDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { toast } = useToast();

  const currentProject = projects.find(p => p.id === projectId);

  // Apply smart defaults when dialog opens or project/member changes
  useEffect(() => {
    if (open && currentProject && preSelectedMember) {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create a complete mock stakeholder object with all required properties
      const mockStakeholder = {
        id: preSelectedMember.user_id || '',
        profile_id: preSelectedMember.user_id,
        stakeholder_type: 'employee' as const,
        company_name: preSelectedMember.name,
        contact_person: preSelectedMember.name,
        phone: null,
        email: null,
        address: null,
        specialties: [] as string[], // Empty array instead of undefined
        crew_size: null,
        status: 'active' as const,
        insurance_expiry: null,
        license_number: null,
        notes: null,
        rating: 0,
        created_at: currentDate,
        updated_at: currentDate
      };

      const memberDefaults = getTeamMemberDefaults(
        mockStakeholder,
        currentProject,
        currentDate
      );

      // Set smart defaults
      setPriority(getDefaultPriority(currentProject.phase));
      setEstimatedHours(memberDefaults.hours_allocated?.toString() || '4');
      
      // Set default title based on member role and project phase
      if (preSelectedMember.role && currentProject.phase) {
        const phaseAction = currentProject.phase === 'punch_list' ? 'Inspect' : 
                           currentProject.phase === 'closeout' ? 'Finalize' : 'Work on';
        setTitle(`${phaseAction} - ${preSelectedMember.role}`);
      }
    }
  }, [open, currentProject, preSelectedMember]);

  // Update skills and priority when category changes
  useEffect(() => {
    if (category && currentProject) {
      const categorySkills = getDefaultRequiredSkills(category, currentProject.phase);
      setRequiredSkills(categorySkills);
      
      const smartPriority = getDefaultPriority(currentProject.phase, category);
      setPriority(smartPriority);
    }
  }, [category, currentProject]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const taskData = {
      title,
      description: description || undefined,
      project_id: projectId,
      priority,
      category: category || undefined,
      due_date: dueDate || undefined,
      estimated_hours: estimatedHours ? parseInt(estimatedHours) : undefined,
      progress: 0,
      status: 'not-started' as const,
      required_skills: requiredSkills.length > 0 ? requiredSkills : undefined,
      assigned_stakeholder_id: preSelectedMember?.user_id || undefined
    };

    const { error } = await createTask(taskData);

    if (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Unknown error occurred';
      toast({
        title: "Error creating task",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Task created successfully",
        description: `${title} has been assigned to ${preSelectedMember?.name || 'team member'}`
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setEstimatedHours('');
      setRequiredSkills([]);
      setCategory('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={20} />
            Create Task for {preSelectedMember?.name || 'Team Member'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {preSelectedMember && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-800">{preSelectedMember.name}</div>
                  <div className="text-sm text-blue-600">{preSelectedMember.role}</div>
                </div>
                <div className="text-right text-sm text-blue-600">
                  <div>{preSelectedMember.availability}% available</div>
                  <div>${preSelectedMember.cost_per_hour}/hr</div>
                </div>
              </div>
              {currentProject && (
                <p className="text-xs text-blue-600 mt-2">
                  Smart defaults applied for {currentProject.phase} phase
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Task for ${preSelectedMember?.name || 'team member'}`}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Safety, Quality Control, Installation"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the task details..."
            />
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline" size="sm">
                Add
              </Button>
            </div>
            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Est. Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Creating...' : 'Create & Assign Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
