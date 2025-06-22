
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
import { taskSchema, type TaskFormData, validateFormData } from '@/schemas';
import { sanitizeInput, sanitizeStringArray } from '@/utils/validation';
import { calculateSkillMatch, getSkillsForPunchListCategory, PunchListCategory } from '@/utils/skill-matching';
import { getTaskDefaults } from '@/utils/smart-defaults';
import { X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDialog = ({ open, onOpenChange }: CreateTaskDialogProps) => {
  const [formData, setFormData] = useState<Partial<TaskFormData>>({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium',
    status: 'not-started',
    category: '',
    due_date: '',
    start_date: '',
    estimated_hours: undefined,
    required_skills: [],
    punch_list_category: undefined,
    assigned_stakeholder_id: undefined,
    task_type: 'regular',
    progress: 0
  });

  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { stakeholders } = useStakeholders();
  const { toast } = useToast();

  const selectedProject = projects.find(p => p.id === formData.project_id);

  // Apply smart defaults when project changes
  useEffect(() => {
    if (selectedProject) {
      const defaults = getTaskDefaults(selectedProject);
      setFormData(prev => ({ ...prev, ...defaults }));
    }
  }, [selectedProject]);

  // Filter stakeholders to get workers with skills
  const workers = stakeholders.filter(s => 
    (s.stakeholder_type === 'employee' || s.stakeholder_type === 'subcontractor') && 
    s.status === 'active'
  );

  const handleInputChange = (field: keyof TaskFormData, value: string | number | string[] | undefined) => {
    // Sanitize input based on field type
    let sanitizedValue: any = value;
    
    switch (field) {
      case 'title':
      case 'category':
        sanitizedValue = sanitizeInput(value as string, 'text');
        break;
      case 'description':
        sanitizedValue = sanitizeInput(value as string, 'html');
        break;
      case 'estimated_hours':
        sanitizedValue = value === '' || value === undefined ? undefined : Number(value);
        break;
      case 'required_skills':
        sanitizedValue = sanitizeStringArray(value as string[]);
        break;
      default:
        sanitizedValue = value;
    }
    
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddSkill = () => {
    const sanitizedSkill = sanitizeInput(newSkill, 'text') as string;
    if (sanitizedSkill && !formData.required_skills?.includes(sanitizedSkill)) {
      const updatedSkills = [...(formData.required_skills || []), sanitizedSkill];
      handleInputChange('required_skills', updatedSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = formData.required_skills?.filter(skill => skill !== skillToRemove) || [];
    handleInputChange('required_skills', updatedSkills);
  };

  const handlePunchListCategoryChange = (category: PunchListCategory | 'none') => {
    handleInputChange('punch_list_category', category === 'none' ? undefined : category);
    if (category !== 'none') {
      const categorySkills = getSkillsForPunchListCategory(category as PunchListCategory);
      const newSkills = [...(formData.required_skills || [])];
      categorySkills.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill);
        }
      });
      handleInputChange('required_skills', newSkills);
    }
  };

  const validateForm = (): boolean => {
    const validation = validateFormData(taskSchema, formData);
    
    if (!validation.success) {
      setErrors(validation.errors || {});
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const validation = validateFormData(taskSchema, formData);
      if (!validation.success || !validation.data) {
        throw new Error('Form validation failed');
      }

      // Ensure estimated_hours is a number or undefined
      const taskData = {
        ...validation.data,
        estimated_hours: typeof validation.data.estimated_hours === 'string' 
          ? parseInt(validation.data.estimated_hours) || undefined 
          : validation.data.estimated_hours
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
          description: `${validation.data.title} has been created with enhanced security validation`
        });
        
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      priority: 'medium',
      status: 'not-started',
      category: '',
      due_date: '',
      start_date: '',
      estimated_hours: undefined,
      required_skills: [],
      punch_list_category: undefined,
      assigned_stakeholder_id: undefined,
      task_type: 'regular',
      progress: 0
    });
    setNewSkill('');
    setErrors({});
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field]?.[0];
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
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title (max 200 characters)"
              required
              className={getFieldError('title') ? 'border-red-500' : ''}
            />
            {getFieldError('title') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {getFieldError('title')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select 
              value={formData.project_id || ''} 
              onValueChange={(value) => handleInputChange('project_id', value)} 
              required
            >
              <SelectTrigger className={getFieldError('project_id') ? 'border-red-500' : ''}>
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
            {getFieldError('project_id') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {getFieldError('project_id')}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task (max 5,000 characters)"
              rows={3}
              className={getFieldError('description') ? 'border-red-500' : ''}
            />
            {getFieldError('description') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {getFieldError('description')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task_type">Task Type</Label>
              <Select 
                value={formData.task_type || 'regular'} 
                onValueChange={(value: 'regular' | 'punch_list') => handleInputChange('task_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Task</SelectItem>
                  <SelectItem value="punch_list">Punch List Item</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority || 'medium'} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => handleInputChange('priority', value)}
              >
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
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'not-started'} 
                onValueChange={(value: 'not-started' | 'in-progress' | 'completed' | 'blocked') => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (max 50 characters)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <Button type="button" onClick={handleAddSkill} variant="outline">
                Add
              </Button>
            </div>
            {formData.required_skills && formData.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.required_skills.map((skill) => (
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
            {getFieldError('required_skills') && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {getFieldError('required_skills')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Est. Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={formData.estimated_hours?.toString() || ''}
                onChange={(e) => handleInputChange('estimated_hours', e.target.value)}
                placeholder="0"
                min="0"
                max="10000"
                className={getFieldError('estimated_hours') ? 'border-red-500' : ''}
              />
              {getFieldError('estimated_hours') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {getFieldError('estimated_hours')}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className={getFieldError('due_date') ? 'border-red-500' : ''}
              />
              {getFieldError('due_date') && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {getFieldError('due_date')}
                </p>
              )}
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fix the validation errors above before submitting.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.project_id}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
