
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
import { useStakeholders } from '@/hooks/useStakeholders';
import { useToast } from '@/hooks/use-toast';
import { calculateSkillMatchPercentage, PUNCH_LIST_CATEGORY_SKILLS, getSkillsForPunchListCategory, filterAndSortWorkersBySkillMatch, PunchListCategory } from '@/utils/skill-matching';
import { getTaskDefaults, getDefaultRequiredSkills, getDefaultPriority, getDefaultCategories } from '@/utils/smart-defaults';
import { X } from 'lucide-react';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [punchListCategory, setPunchListCategory] = useState<PunchListCategory | ''>('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const selectedProject = projects.find(p => p.id === projectId);

  // Apply smart defaults when project changes
  useEffect(() => {
    if (selectedProject) {
      const defaults = getTaskDefaults(selectedProject);
      setPriority(defaults.priority || 'medium');
      setEstimatedHours(defaults.estimated_hours?.toString() || '');
      setPunchListCategory(defaults.punch_list_category || '');
      
      // Set default required skills
      if (defaults.required_skills && defaults.required_skills.length > 0) {
        setRequiredSkills(defaults.required_skills);
      }

      // Set default category based on project phase
      const defaultCategories = getDefaultCategories(selectedProject.phase);
      if (defaultCategories.length > 0 && !category) {
        setCategory(defaultCategories[0]);
      }
    }
  }, [selectedProject]);

  // Update skills when category changes
  useEffect(() => {
    if (category && selectedProject) {
      const categorySkills = getDefaultRequiredSkills(category, selectedProject.phase);
      if (categorySkills.length > 0) {
        setRequiredSkills(prev => {
          const newSkills = [...prev];
          categorySkills.forEach(skill => {
            if (!newSkills.includes(skill)) {
              newSkills.push(skill);
            }
          });
          return newSkills;
        });
      }
    }
  }, [category, selectedProject]);

  // Filter stakeholders to get workers with skills
  const workers = stakeholders.filter(s => 
    (s.stakeholder_type === 'employee' || s.stakeholder_type === 'subcontractor') && 
    s.status === 'active'
  );

  // Get sorted workers based on skill match
  const sortedWorkers = filterAndSortWorkersBySkillMatch(workers, requiredSkills);

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setRequiredSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handlePunchListCategoryChange = (category: PunchListCategory) => {
    setPunchListCategory(category);
    const categorySkills = getSkillsForPunchListCategory(category);
    setRequiredSkills(prev => {
      const newSkills = [...prev];
      categorySkills.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill);
        }
      });
      return newSkills;
    });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    // Auto-set priority based on category and project phase
    if (selectedProject) {
      const smartPriority = getDefaultPriority(selectedProject.phase, newCategory);
      setPriority(smartPriority);
    }
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
      punch_list_category: punchListCategory || undefined,
      assigned_stakeholder_id: assigneeId || undefined
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
        description: `${title} has been created`
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setProjectId('');
      setPriority('medium');
      setCategory('');
      setDueDate('');
      setEstimatedHours('');
      setRequiredSkills([]);
      setPunchListCategory('');
      setAssigneeId('');
      onOpenChange(false);
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name} {project.phase && (
                      <span className="text-xs text-slate-500 ml-2">({project.phase})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProject && (
              <p className="text-xs text-blue-600">
                Smart defaults applied for {selectedProject.phase} phase
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {selectedProject && getDefaultCategories(selectedProject.phase).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProject?.phase === 'punch_list' && (
            <div className="space-y-2">
              <Label htmlFor="punchListCategory">Punch List Category</Label>
              <Select value={punchListCategory} onValueChange={handlePunchListCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select punch list category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PUNCH_LIST_CATEGORY_SKILLS).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
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

          {requiredSkills.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee (filtered by skill match)</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {sortedWorkers.map((worker) => {
                    const matchPercentage = calculateSkillMatchPercentage(requiredSkills, worker.specialties || []);
                    return (
                      <SelectItem key={worker.id} value={worker.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{worker.contact_person || worker.company_name || 'Unknown Worker'}</span>
                          <Badge 
                            variant={matchPercentage >= 80 ? "default" : matchPercentage >= 50 ? "secondary" : "outline"}
                            className="ml-2"
                          >
                            {matchPercentage}% match
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          
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
            <Button type="submit" disabled={loading || !projectId}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
