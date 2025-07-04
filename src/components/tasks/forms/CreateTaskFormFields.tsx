
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { TaskSkillsField } from './TaskSkillsField';

import { TaskFormData } from '@/schemas';
import { Project } from '@/types/database';
import { Stakeholder } from '@/hooks/useStakeholders';
import { getSkillsForPunchListCategory, PunchListCategory } from '@/utils/skill-matching';

interface CreateTaskFormFieldsProps {
  formData: Partial<TaskFormData>;
  projects: Project[];
  selectedProject?: Project;
  workers: Stakeholder[];
  newSkill: string;
  setNewSkill: (skill: string) => void;
  errors: Record<string, string[]>;
  onInputChange: (field: keyof TaskFormData, value: string | number | string[] | undefined) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
  getFieldError: (field: string) => string | undefined;
}

export const CreateTaskFormFields = ({
  formData,
  projects,
  selectedProject,
  workers,
  newSkill,
  setNewSkill,
  errors,
  onInputChange,
  onAddSkill,
  onRemoveSkill,
  getFieldError
}: CreateTaskFormFieldsProps) => {
  const handlePunchListCategoryChange = (category: PunchListCategory | 'none') => {
    onInputChange('punch_list_category', category === 'none' ? undefined : category);
    if (category !== 'none') {
      const categorySkills = getSkillsForPunchListCategory(category as PunchListCategory);
      const newSkills = [...(formData.required_skills || [])];
      categorySkills.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill);
        }
      });
      onInputChange('required_skills', newSkills);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title || ''}
          onChange={(e) => onInputChange('title', e.target.value)}
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
          onValueChange={(value) => onInputChange('project_id', value)} 
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
          onChange={(e) => onInputChange('description', e.target.value)}
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
            onValueChange={(value: 'regular' | 'punch_list') => onInputChange('task_type', value)}
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
            onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => onInputChange('priority', value)}
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
            onValueChange={(value: 'not-started' | 'in-progress' | 'completed' | 'blocked') => onInputChange('status', value)}
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

      <TaskSkillsField
        requiredSkills={formData.required_skills || []}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        onAddSkill={onAddSkill}
        onRemoveSkill={onRemoveSkill}
        error={getFieldError('required_skills')}
      />


      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Est. Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            value={formData.estimated_hours?.toString() || ''}
            onChange={(e) => onInputChange('estimated_hours', e.target.value)}
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
            onChange={(e) => onInputChange('due_date', e.target.value)}
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
    </>
  );
};
